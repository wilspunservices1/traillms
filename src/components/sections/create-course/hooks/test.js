const { useCallback } = require("react");
const { useState } = require("react");

const useChapterEditing = (initialChapters) => {
    const [chapters, setChapters] = useState(initialChapters);

    const toggleEditing = useCallback((index) => {
        setChapters((prevChapters) =>
            prevChapters.map((chapter, i) => ({
                ...chapter,
                editing: i === index ? !chapter.editing : chapter.editing,
            }))
        );
    }, []);

    const addChapter = useCallback(() => {
        setChapters((prevChapters) => [
            ...prevChapters,
            {
                id: prevChapters.length + 1,
                name: `Chapter ${prevChapters.length + 1}: New Chapter`,
                description: "",
                lectures: [],
            },
        ]);
    }, []);

    const removeChapter = useCallback((index) => {
        setChapters((prevChapters) => prevChapters.filter((_, i) => i !== index));
    }, []);

    const updateChapter = useCallback((index, updatedChapter) => {
        setChapters((prevChapters) => {
            const newChapters = [...prevChapters];
            newChapters[index] = updatedChapter;
            return newChapters;
        });
    }, []);

    const setInitialChapters = useCallback((chapters) => {
        setChapters(chapters);
    }, []);

    return { chapters, toggleEditing, addChapter, removeChapter, updateChapter, setInitialChapters };
};


export default useChapterEditing;