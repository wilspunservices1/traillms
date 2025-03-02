// src/app/actions/fetchUserDetailsFromApi.ts
export async function fetchUserDetailsFromApi(userId: string) {
  try {
    const response = await fetch(`/api/user/${userId}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user details: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in fetchUserDetailsFromApi:", error);
    throw error;
  }
}

export async function changeProfileImage(userId: string, image: string) {
  try {
    if (userId && image) {
      const res = await fetch(`/api/user/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message);
      }
      return data;
    }

    return null;
  } catch (error) {
    console.error("Error in changeProfileImage:", error);
    throw error;
  }
}
