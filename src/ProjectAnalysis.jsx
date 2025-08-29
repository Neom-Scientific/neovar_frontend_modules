import axios from 'axios';
import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie';

const ProjectAnalysis = () => {
    const [progressData, setProgressData] = useState([]);
    const [counterData, setCounterData] = useState([]);
    const user = Cookies.get('neovar_user') || '';
    const email = JSON.parse(user).email;

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const sessionId = localStorage.getItem('sessionId');
                if (!sessionId || !email) {
                    setProgressData([]);
                    return;
                }
                const response = await axios.get(
                    `${process.env.REACT_APP_URL}progress?sessionId=${encodeURIComponent(sessionId)}&email=${encodeURIComponent(email)}`
                );
                if(response.data[0].status === 404){
                    return setProgressData([]);
                }
                const data = response.data.rows[0];
                setProgressData([data]); // Wrap in array for table rendering
            } catch (error) {
                console.error('Error fetching progress:', error);
                setProgressData([]);
            }
        };
        fetchProgress();
        const interval = setInterval(fetchProgress, 5000); // Fetch every 5 seconds
        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_URL}read-counter-json?email=${email}`);
                if(response.status === 200) {
                setCounterData(response.data);
                }
                else if (response.data[0].status === 404) {
                    setCounterData([]);
                }
            } catch (error) {
                console.error('API error:', error);
            }
        }
        fetchData();
    }, []);

    return (
        <div className="w-full px-8 py-4">
            <div className="overflow-auto max-h-[70vh]">
                <table className="min-w-full">
                    <thead className="bg-orange-100">
                        <tr>
                            <th className="px-4 py-2 text-left sticky top-0 bg-orange-100 z-10">Project Id</th>
                            <th className="px-4 py-2 text-left sticky top-0 bg-orange-100 z-10">Project Name</th>
                            <th className="px-4 py-2 text-left sticky top-0 bg-orange-100 z-10">Creation Time</th>
                            <th className="px-4 py-2 text-left sticky top-0 bg-orange-100 z-10">Progress</th>
                            <th className="px-4 py-2 text-left sticky top-0 bg-orange-100 z-10">Number Of Sample</th>
                        </tr>
                    </thead>
                    <tbody>
                        {progressData.length > 0 && (progressData.map((item, idx) => (
                            <tr key={item.projectid || idx}>
                                <td className="px-4 py-2">{item.projectid}</td>
                                <td className='px-4 py-2'>{item.projectname}</td>
                                <td className="px-4 py-2">
                                    {new Date(parseInt(item.starttime)).toLocaleString()}</td>
                                <td>
                                    <progress value={item.progress} max="100" />
                                    {` ${item.progress}%`}
                                </td>
                                <td className="px-4 py-2">{item.numberofsamples}</td>
                            </tr>
                        ))
                        )}
                        {counterData && counterData.length > 0 && counterData[0].status !== 404 ?
                            counterData.map((item, index) => (
                                <tr key={index} className="border-t">
                                    <td className="px-4 py-2">{item.projectid}</td>
                                    <td className="px-4 py-2">{item.projectname}</td>
                                    <td className="px-4 py-2">{new Date(parseInt(item.creationtime)).toLocaleString()}</td>
                                    <td className='px-4 py-2'>100%</td>
                                    <td className="px-4 py-2">{item.numberofsamples}</td>
                                </tr>
                            ))
                            :
                            <tr>
                                <td colSpan="5" className="px-4 py-2 text-center text-lg font-bold text-orange-500">
                                    No Project Found
                                </td>
                            </tr>

                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default ProjectAnalysis;