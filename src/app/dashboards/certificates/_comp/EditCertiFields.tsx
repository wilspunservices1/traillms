// components/certifications/EditCertiFields.tsx
'use client';
import React, { useEffect, useState } from 'react';
import TabsButton from './Tabs';
import DesignTab from './DesignTab';
import useTab from '@/hooks/useTab';
import { fetchCertificateDetails } from '@/actions/certification';
import { initialPlaceholders } from '@/assets/mock'; // Ensure the path is correct

interface EditCertiFieldsProps {
  setDesignData: (data: any) => void; 
}

const EditCertiFields: React.FC<EditCertiFieldsProps> = ({ setDesignData }) => {
  const { currentIdx, handleTabClick } = useTab();
  const [certificateData, setCertificateData] = useState<any>(null);
  const [placeholders, setPlaceholders] = useState<any[]>(initialPlaceholders); // Initialize with mock data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const certificateId = 'e901b7fe-0255-4ac1-8767-29d05f52e394'; 

  // Fetch certificate details
  const fetchCertificateDetailsData = async () => {
    setLoading(true);
    try {
      const data = await fetchCertificateDetails(certificateId);
      setCertificateData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificateDetailsData();
  }, []);

  // Handle setting placeholder positions
  const handleSetPlaceholderPosition = (id: string, x: number, y: number) => {
    setPlaceholders((prev) =>
      prev.map((placeholder) => 
        placeholder.id === id ? { ...placeholder, x: x, y: y } : placeholder
      )
    );
  };

  // Define the content for each tab
  const tabButtons = [
    {
      name: 'Design',
      content: (
        <DesignTab
          certificateData={certificateData} // Ensure this is being passed correctly
          isEditing={true}
          instructorName={"test"} // Adjust as necessary
          setDesignData={setDesignData}
          placeholders={placeholders}
          setPlaceholders={setPlaceholders} // Pass the setPlaceholders function
          setPlaceholderPosition={handleSetPlaceholderPosition} // Pass the function for setting placeholder positions
        />
      ),
    },
    { name: 'Details', content: <div>Details Content</div> },
    { name: 'Mandatory Classes', content: <div>Mandatory Classes Content</div> },
    { name: 'Mandatory Tests', content: <div>Mandatory Tests Content</div> },
    { name: 'Mandatory Homework', content: <div>Mandatory Homework Content</div> },
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div>
      {/* Tab Navigation */}
      <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px">
          {tabButtons.map(({ name }, idx) => (
            <TabsButton
              key={idx}
              name={name}
              idx={idx}
              currentIdx={currentIdx}
              handleTabClick={handleTabClick}
            />
          ))}
        </ul>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {tabButtons.map(({ content }, idx) => (
          <div key={idx} className={idx === currentIdx ? 'block' : 'hidden'}>
            {content}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditCertiFields;
