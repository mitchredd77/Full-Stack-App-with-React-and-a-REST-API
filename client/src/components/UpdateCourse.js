import { useState, useContext, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import UserContext from "../context/UserContext";
import { api } from "../utils/apiHelper";
import ValidationErrors from "./ValidationErrors"; // Import ValidationErrors component

// Function to update course
const UpdateCourse = () => {
    const { authUser } = useContext(UserContext);
    const navigate = useNavigate();
    let { id } = useParams();
    const courseTitle = useRef(null);
    const courseDescription = useRef(null);
    const estimatedTime = useRef(null);
    const materialsNeeded = useRef(null);
    const [course, setCourse] = useState(null);
    const [errors, setErrors] = useState([]);

    // retrieve course
    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await api(`/courses/${id}`, "GET", null, authUser);
                console.log("API Response:", response);
                if (response.status === 200) {
                    const data = await response.json()
                    if (data === null) {
                        navigate("/notfound");
                    }
                    // Check if user's id matches user id that created the course
                    if (authUser.id !== data.userId) {
                        navigate("/forbidden");
                    }
                    setCourse(data);
                } else if (response.status === 404) {
                    navigate("/notfound");
                } else if (response.status === 500) {
                    navigate("/error");
                } else {
                    throw new Error();
                }
            } catch (error) {
                console.log("Error fetching data:", error);
                navigate("/error");
            }
        };

        fetchCourse();
    }, [authUser, id, navigate]);
    // Handles course revision submission
    const handleSubmit = async (event) => {
        event.preventDefault();
        // Values to update the course
        const updateCourse = {
            userId: authUser.id,
            title: courseTitle.current.value,
            description: courseDescription.current.value,
            estimatedTime: estimatedTime.current.value,
            materialsNeeded: materialsNeeded.current.value
        };

        try {
            const response = await api(`/courses/${id}`, "PUT", updateCourse, authUser);
            if (response.status === 204) {
                navigate(`/courses/${id}`);
            } else if (response.status === 500) {
                navigate("/error");
            } else if (response.status === 404) {
                navigate("/notfound");
            } else if (response.status === 400) {
                const data = await response.json();
                setErrors(data.errors);
            } else {
                throw new Error();
            }
        } catch (error) {
            navigate("/error");
        }
    };

    const handleCancel = (event) => {
        event.preventDefault();
        navigate("/");
    };

    return (
        <main>
            <div className="wrap">
                <h2>Update Course</h2>
                <ValidationErrors errors={errors} />
                {course && (
                    <form onSubmit={handleSubmit}>
                        <div className="main--flex">
                            <div>
                                <label htmlFor="courseTitle">Course Title</label>
                                <input
                                    id="courseTitle"
                                    name="courseTitle"
                                    type="text"
                                    ref={courseTitle}
                                    defaultValue={course ? course.title : ''}
                                />
                                <p>
                                    By {authUser.firstName} {authUser.lastName}
                                </p>
                                <label htmlFor="courseDescription">Course Description</label>
                                <textarea
                                    id="courseDescription"
                                    name="courseDescription"
                                    ref={courseDescription}
                                    defaultValue={course ? course.description : ''}
                                ></textarea>
                            </div>
                            <div>
                                <label htmlFor="estimatedTime">Estimated Time</label>
                                <input
                                    id="estimatedTime"
                                    name="estimatedTime"
                                    type="text"
                                    ref={estimatedTime}
                                    defaultValue={course ? course.estimatedTime : ''}
                                />
                                <label htmlFor="materialsNeeded">Materials Needed</label>
                                <textarea
                                    id="materialsNeeded"
                                    name="materialsNeeded"
                                    ref={materialsNeeded}
                                    defaultValue={course ? course.materialsNeeded : ''}
                                ></textarea>
                            </div>
                        </div>
                        <button className="button" type="submit">
                            Update Course
                        </button>
                        <button className="button button-secondary" onClick={handleCancel}>
                            Cancel
                        </button>
                    </form>
                )}
            </div>
        </main>
    );
};

export default UpdateCourse;
