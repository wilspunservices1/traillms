// types.ts

export type Lecture = {
    title: string;
    id: string;
    chapterId: string;
    duration: string;
    description: string | null;
    order: string | null;
    videoUrl: string;
    isPreview: boolean | null;
    isLocked: boolean | null;
  };
  

export interface Chapter {
    id: number | string;
    title: string;
    duration: string;
    lectures: Lecture[];
    description?: string; // Include the description property here
    order?: string;
}


// types/User.ts
export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  phoneNumber: string;
  uniqueIdentifier: string;
  enrolledCoursesCount: number;
  createdAt: string;
  roles: string[];
  // Add other relevant fields as needed
}

export interface UserTableProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  isLoading: boolean;
  fallbackMessage?: string; // Optional prop for custom messages
}
// types/UserDetails.ts
export interface EnrolledCourse {
  courseId: string;
  progress: number;
  completedLectures: string[];
}

export interface UserSocials {
  facebook: string;
  twitter: string;
  linkedin: string;
  website: string;
  github: string;
}

// src/types/type.ts

export interface UserDetailsType {
  id: string;
  name: string;
  username?: string;
  phone?: string;
  email: string;
  image?: string;
  roles: string[];
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  biography: string;
  expertise: string[];
  registrationDate: string;
  enrolledCourses?: any[]; // Define a proper type based on your course structure
  wishlist?: any[]; // Define a proper type based on your wishlist structure
  socials: {
    facebook: string;
    twitter: string;
    linkedin: string;
    website: string;
    github: string;
  };
}



// types.ts for -> Certification

export interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fill: string;
}

// export interface ImageElement {
//   id: string;
//   src: string;
//   x: number;
//   y: number;
// }
// types/type.ts

export interface ImageElement {
  id: string;
  src: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
}

