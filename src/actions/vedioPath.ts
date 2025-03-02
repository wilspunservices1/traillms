// Convert local path to URL for videos
export const convertLocalPathToUrl = (videoUrl : string) => {
    if (videoUrl.startsWith("D:\\AI_LMS\\public\\uploads\\")) {
      return videoUrl.replace("D:\\AI_LMS\\public\\uploads\\", "/uploads/");
    }
    return videoUrl;
  };