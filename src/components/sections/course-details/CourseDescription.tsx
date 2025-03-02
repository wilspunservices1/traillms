"use client"
import React, { useEffect, useState } from 'react';

interface Props {
  description: string;
}

const CourseDescription: React.FC<Props> = ({ description }) => {
  const [firstParagraphHtml, setFirstParagraphHtml] = useState<string>('');
  const [remainingContentHtml, setRemainingContentHtml] = useState<string>('');

  useEffect(() => {
    if (description) {
      // Use DOMParser only on the client side
      const extractFirstParagraph = (htmlContent: string) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        
        // Extract the first <p> element
        const firstParagraph = doc.querySelector('p') as Element;
        return firstParagraph ? firstParagraph.outerHTML : '';
      };

      const extractRemainingContent = (htmlContent: string) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        
        // Remove the first <p> element to get the remaining content
        const firstParagraph = doc.querySelector('p');
        if (firstParagraph) {
          firstParagraph.remove();
        }
        
        return doc.body.innerHTML; // Return the rest of the content
      };

      setFirstParagraphHtml(extractFirstParagraph(description));
      setRemainingContentHtml(extractRemainingContent(description));
    }
  }, [description]);

  return (
    <div>
      {/* Render the first paragraph */}
      <div
        className="text-sm md:text-lg text-contentColor dark:text-contentColor-dark mb-25px !leading-30px"
        data-aos="fade-up"
        dangerouslySetInnerHTML={{ __html: firstParagraphHtml }}
      />

      {/* Render the remaining content (like lists, bullet points, etc.) */}
      {remainingContentHtml && (
        <div
          className="additional-content mt-4"
          dangerouslySetInnerHTML={{ __html: remainingContentHtml }}
        />
      )}
    </div>
  );
};

export default CourseDescription;
