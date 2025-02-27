"use client";

import { useEffect, useState } from "react";
import Attachments from "./File";

type ExtrasData = {
  languages: string[];
  links: string[];
  filePaths: string[];
};

type Props = {
  lessonId: string; // lessonId passed as a prop
};

const Extras: React.FC<Props> = ({ lessonId }) => {
  const [extras, setExtras] = useState<ExtrasData | null>(null); // State to store extras
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  // Fetch extras by lessonId
  useEffect(() => {
    const fetchExtras = async () => {
      try {
        const res = await fetch(`/api/courses/chapters/${lessonId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch extras");
        }
        const data = await res.json();
        setExtras(data.extras); // Store extras from API response
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchExtras();
  }, [lessonId]);

  if (loading) {
    return <p>Loading course materials...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!extras) {
    return <p>No course materials available.</p>;
  }

  return (
    <div>
      <h4 className="text-xl text-black dark:text-blackColor-dark leading-1 font-light">
        <i className="icofont-file-text mr-10px"></i>
        Course Materials
      </h4>

      {/* Display Languages */}
      <div className="mt-4">
        <h5 className="font-semibold">Languages:</h5>
        <ul className="ml-4 list-disc">
          {extras.languages?.length > 0 ? (
            extras.languages.map((lang, index) => <li key={index}>{lang}</li>)
          ) : (
            <li>No languages available.</li>
          )}
        </ul>
      </div>

      {/* Display Links */}
      <div className="mt-2">
        <h5 className="font-semibold">Links:</h5>
        <ul className="ml-4 list-disc">
          {extras.links?.length > 0 ? (
            extras.links.map((link, index) => (
              <li key={index}>
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primaryColor underline"
                >
                  {link}
                </a>
              </li>
            ))
          ) : (
            <li>No links available.</li>
          )}
        </ul>
      </div>

      {/* Display File Paths */}
      <div className="mt-2">
        <Attachments files={extras.filePaths} />
      </div>
    </div>
  );
};

export default Extras;



// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import Attachments from "./File";

// type ExtrasData = {
//   languages: string[];
//   links: string[];
//   filePaths: string[];
// };

// type Props = {
//   lessonId: string; // lessonId passed as a prop
// };

// const Extras: React.FC<Props> = ({ lessonId }) => {
//   const [extras, setExtras] = useState<ExtrasData | null>(null); // State to store extras
//   const [loading, setLoading] = useState(true); // Loading state
//   const [error, setError] = useState<string | null>(null); // Error state

//   console.log("extras from MAIN extras",extras)

//   // Fetch extras by lessonId
//   useEffect(() => {
//     const fetchExtras = async () => {
//       try {
//         const res = await fetch(`/api/courses/chapters/${lessonId}`);
//         if (!res.ok) {
//           throw new Error("Failed to fetch extras");
//         }
//         const data = await res.json();
//         console.log("data extras",data)
//         setExtras(data.extras); // Store extras from API response
//         setLoading(false);
//       } catch (err) {
//         setError(err.message);
//         setLoading(false);
//       }
//     };

//     fetchExtras();
//   }, [lessonId]);

//   if (loading) {
//     return <p>Loading course materials...</p>;
//   }

//   if (error) {
//     return <p>Error: {error}</p>;
//   }

//   if (!extras) {
//     return <p>No course materials available.</p>;
//   }

//   return (
//     <div>
//       <h4 className="text-blackColor dark:text-blackColor-dark leading-1 font-light">
//         <i className="icofont-file-text mr-10px"></i>
//         Course Materials
//       </h4>

//       {/* Display Languages */}
//       <div className="mt-4">
//         <h5 className="font-semibold">Languages:</h5>
//         <ul className="ml-4 list-disc">
//           {extras.languages?.length > 0 ? (
//             extras.languages.map((lang, index) => <li key={index}>{lang}</li>)
//           ) : (
//             <li>No languages available.</li>
//           )}
//         </ul>
//       </div>

//       {/* Display Links */}
//       <div className="mt-2">
//         <h5 className="font-semibold">Links:</h5>
//         <ul className="ml-4 list-disc">
//           {extras.links?.length > 0 ? (
//             extras.links.map((link, index) => (
//               <li key={index}>
//                 <a
//                   href={link}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="text-primaryColor underline"
//                 >
//                   {link}
//                 </a>
//               </li>
//             ))
//           ) : (
//             <li>No links available.</li>
//           )}
//         </ul>
//       </div>

//       {/* Display File Paths */}
//       <div className="mt-2">
//         <Attachments files={extras.filePaths} />
//       </div>
//     </div>
//   );
// };

// export default Extras;

