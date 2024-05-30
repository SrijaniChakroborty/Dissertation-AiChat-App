import React from "react";

const MarkdownCode = ({ message }) => {
  var flattenedPoints = [];

  function extractBulletPoints(markdownText) {
    // Regular expression to match numbered and hyphenated points
    const regex = /\d+\..+|-\s+.+/g;

    // Extract points from the markdown text
    const points = markdownText.match(regex);

    const splitPoints = points.map((point) => point.split(/\. |-\s+/));

    // Flatten the array
    flattenedPoints = splitPoints
      .flat()
      .filter((point) => point != "" && !/^\d+$/.test(point));
    console.log(flattenedPoints);
  }
  extractBulletPoints(message[2]);

  return (
      <p className="other-text-content markdown-content">
        <code className="language-markdown">
          <h3>Here are the insights for the data you gave:</h3>
          <ul>
            {flattenedPoints.map((point, index) => (
              <li key={index} className="insights-list">
                {point.includes("**") ? point.replaceAll("**", "") : point}
              </li>
            ))}
          </ul>
          <h3>Please let me know if you have other queries about the data.</h3>
        </code>
      </p>
  );
};

export default MarkdownCode;
