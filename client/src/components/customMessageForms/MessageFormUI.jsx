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

const MessageFormUI = ({
  setAttachment,
  message,
  handleChange,
  handleSubmit,
}) => {
  const [preview, setPreview] = useState("");
  const [csvData, setCSV] = useState(null);
  const [isCSV, setIsCSV] = useState(false);
  const [isPDF, setIsPDF] = useState(false); 
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent the default form submission
      const finalMessage =
        isCSV && csvData ? `\`\`\`csv ${csvData}\`\`\`` : e.target.value;
      !preview && !finalMessage
        ? e.preventDefault()
        : handleSubmit(!finalMessage ? " " : finalMessage);
      setPreview("");
    }
  };

  const handleFileDrop = async (file) => {
    setPreview("");
    setAttachment("");
    await processSpreadsheet(file);
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
      handleChange({ target: { value: `\`\`\`csv ${csv}\`\`\`` } });
    };

    reader.readAsArrayBuffer(file);
    toast.success("File uploaded");
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
              }}
            />
            <img
              alt="message-form-preview"
              className="message-form-preview-image"
              src={preview}
              onLoad={() => URL.revokeObjectURL(preview)}
            />
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
                if (
                  file.type ===
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
                  file.type === "application/vnd.ms-excel" ||
                  file.name.endsWith(".csv")
                )
                  handleFileDrop(file);
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
                    : e.target.value;
                // message = isCSV && csvData ? `\`\`\`csv ${csvData}\`\`\`` : e.target.value;
                // console.log('finalMesage',finalMessage)
                // finalMessage ? handleSubmit(finalMessage) :e.preventDefault();
                !preview && !finalMessage
                  ? e.preventDefault()
                  : handleSubmit(finalMessage ? finalMessage : " ");
                setIsCSV(false);
                setCSV(null);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageFormUI;
