export const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      const response = await fetch('https://gowithflow-backend.onrender.com/api/upload/test-upload', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error('File upload failed');
      }
  
      const data = await response.json();
      return data.file.url;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };