export const formatDate = (dateString) => {
    const date = new Date(dateString);
    
    // Define options for the date format
    const options : { [key: string]: string } = { year: 'numeric', month: 'short', day: 'numeric' };
    
    // Format the date
    return date.toLocaleDateString('en-US', options);
  };