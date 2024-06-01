import React, { useState } from "react";
import {
  MinusCircleIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import Dropzone from "react-dropzone";
import ExcelJS from "exceljs";
import toast, { Toaster } from "react-hot-toast";
import {CloseCircleFilled} from '@ant-design/icons';
import * as pdfjsLib from 'pdfjs-dist';
const MessageFormUI = ({
  setAttachment,
  message,
  handleChange,
  handleSubmit,
}) => {
  const [preview, setPreview] = useState("");
  const [csvData, setCSV] = useState(null);
  const [isCSV, setIsCSV] = useState(false);
  const [isPDF, setIsPDF] = useState(null); 
  const [filename, setFileName] = useState('');
  const [pdfText, setPdfText] = useState("");


  pdfjsLib.GlobalWorkerOptions.workerSrc='node_modules/pdfjs-dist/build/pdf.worker.mjs';

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent the default form submission
      const finalMessage =
        isCSV && csvData
          ? `\`\`\`csv ${csvData}\`\`\``
          : isPDF && pdfText
            ? `\`\`\`pdf ${pdfText}\`\`\``
            : e.target.value;
      !preview && !finalMessage
        ? e.preventDefault()
        : handleSubmit(!finalMessage ? " " : finalMessage);
      setPreview("");
      
    }
  };

  const handleFileDrop = async (file) => {
    // setPreview("");
    // setAttachment("");
    if (file.name.includes(".pdf") || file.name.includes('.docx')) {
      setIsPDF(true);
      setIsCSV(false);
      setFileName(file.name);
      if(file.name.includes('.pdf'))
        await processPDF(file);
    } else {
      setIsPDF(false);
      setIsCSV(true);
      setFileName(file.name);
      await processSpreadsheet(file);
    }
  };

  const worksheetToCSV = (worksheet) => {
    const rows = [];
    worksheet.eachRow({ includeEmpty: true }, (row) => {
      const rowValues = row.values.slice(1); // Skip the first index which is empty
      rows.push(rowValues.join(";"));
    });
    return rows.join("\n");
  };

  const processSpreadsheet = async (file) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const buffer = event.target.result;
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.worksheets[0];
      const csv = worksheetToCSV(worksheet);
      setCSV(csv);
      setIsCSV(true);
      setIsPDF(false);
      handleChange({ target: { value: `\`\`\`csv ${csv}\`\`\`` } });
    };

    reader.readAsArrayBuffer(file);
    toast.success("File uploaded");
  };

  const processPDF = async (file) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const pdfData = new Uint8Array(event.target.result);
      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
      const textContent = await extractTextFromPDF(pdf);
      setPdfText(textContent);
      // handleChange({ target: { value: `\`\`\`pdf ${textContent}\`\`\`` } });
    };
    reader.readAsArrayBuffer(file);
  };

  const extractTextFromPDF = async (pdf) => {
    let text = "";
    for (let i = 0; i < pdf.numPages; i++) {
      const page = await pdf.getPage(i + 1);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(" ");
      text += pageText + "\n";
    }
    return text.trim();
  };

  const changeHeight= ()=>{
    document.documentElement.style.setProperty('--feed-height', '95vh', 'important');
  }

  return (
    <div>
      <Toaster position="top-center" />
      <div className="message-form-container">
        {preview && (
          <div className="message-form-preview">
            {changeHeight}
            <CloseCircleFilled
              className="message-form-icon-x"
              onClick={() => {
                setPreview("");
                setAttachment("");
                setIsPDF(false);
              }}
            />
            {!isPDF ? (
              <img
                alt="message-form-preview"
                className="message-form-preview-image"
                src={preview}
                onLoad={() => URL.revokeObjectURL(preview)}
              />
            ) : (
              <div className="pdf-preview">{filename}</div>
            )}
          </div>
        )}
        <div className="message-form">
          {/* <div className="message-form-input-container"> */}
          <textarea
            cols="50"
            wrap="physical"
            type="text"
            className="message-form-input"
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyPress}
            placeholder="Send a message... "
            required
          />
          {/* </div> */}
          <div className="message-form-icons">
            <Dropzone
              acceptedFiles=".jpg,.jpeg,.png,.xls,.xlsx,.csv,.pdf"
              multiple={false}
              noClick={!!preview}
              onDrop={(acceptedFiles) => {
                const file = acceptedFiles[0];
                setAttachment(file);
                setPreview(URL.createObjectURL(file));
                if (!file.type.includes('image/')) {
                  handleFileDrop(file);
                }
              }}
            >
              {({ getRootProps, getInputProps, open }) => (
                <div {...getRootProps()}>
                  <input {...getInputProps()} />

                  <PaperClipIcon
                    className="message-form-icon-clip"
                    onClick={open}
                  />
                </div>
              )}
            </Dropzone>
            <hr className="vertical-line" />
            <PaperAirplaneIcon
              className="message-form-icon-airplane"
              onClick={(e) => {
                setPreview("");
                const finalMessage =
                  isCSV && csvData
                    ? `\`\`\`csv ${csvData}\`\`\``
                    : isPDF && pdfText
                      ? `\`\`\`pdf ${pdfText}\`\`\``
                      : e.target.value;
                // message = isCSV && csvData ? `\`\`\`csv ${csvData}\`\`\`` : e.target.value;
                // console.log('finalMesage',finalMessage)
                // finalMessage ? handleSubmit(finalMessage) :e.preventDefault();
                !preview && !finalMessage
                  ? e.preventDefault()
                  : handleSubmit(finalMessage ? finalMessage : " ");
                setIsCSV(false);
                setCSV(null);
                setIsPDF(false);
                setPdfText(null);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageFormUI;