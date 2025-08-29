import axios from 'axios';
import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie';

const Home = () => {
    const [counterData, setCounterData] = useState([]);
    const user = Cookies.get('neovar_user') || '';
    const email = JSON.parse(user).email;
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_URL}read-counter-json?email=${email}`);
                // console.log('response', response.data[0].message);
                if (response.status === 200) {
                    setCounterData(response.data);
                }
                else if(response.data[0].status === 404) {
                    // console.log('404')
                    setCounterData([]);
                }
            } catch (error) {
                if (error.response) {
                    console.error('API error:', error.response.data[0].message);
                }
                console.error('API error:', error);
            }
        }
        fetchData();
    }, []);

    // console.log('counterData', counterData);

    const handleDownloadLink = async (projectid) => {
        try {
            // projectid = 'PRJ-20';
            const response = await axios.get(
                `${process.env.REACT_APP_URL}download-vcf?projectId=${projectid}&email=${localStorage.getItem('email')}`,
                { responseType: 'blob' }
            );
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'vcf_files.zip'); // <-- Use .zip here
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }
        catch (error) {
            console.error('API error:', error);
        }
    }

    // const handleDownloadLink = async (projectid) => {
    //     try {
    //         projectid = 'PRJ-20250826-20';
    //         const response = await axios.get(
    //             `http://localhost:5000/download-vcf?projectId=${projectid}&email=${localStorage.getItem('email')}`,
    //             { responseType: 'blob' }
    //         );
    //         // Try to get filename from Content-Disposition header
    //         let filename = 'vcf_files.zip';
    //         const disposition = response.headers['content-disposition'];
    //         if (disposition && disposition.indexOf('filename=') !== -1) {
    //             filename = disposition
    //                 .split('filename=')[1]
    //                 .replace(/['"]/g, '')
    //                 .trim();
    //         }
    //         const url = window.URL.createObjectURL(new Blob([response.data]));
    //         const link = document.createElement('a');
    //         link.href = url;
    //         link.setAttribute('download', filename);
    //         document.body.appendChild(link);
    //         link.click();
    //         document.body.removeChild(link);
    //         window.URL.revokeObjectURL(url);
    //     }
    //     catch (error) {
    //         console.error('API error:', error);
    //     }
    // }

    return (
        <div className="w-full px-8 py-4">
            <div className="overflow-auto max-h-[70vh]">
                <table className="min-w-full">
                    <thead className="bg-orange-100">
                        <tr>
                            <th className="px-4 py-2 text-left sticky top-0 bg-orange-100 z-10">Project Id</th>
                            <th className="px-4 py-2 text-left sticky top-0 bg-orange-100 z-10">Project Name</th>
                            <th className="px-4 py-2 text-left sticky top-0 bg-orange-100 z-10">Creation Time</th>
                            <th className="px-4 py-2 text-left sticky top-0 bg-orange-100 z-10">Number Of Sample</th>
                            <th className="px-4 py-2 text-left sticky top-0 bg-orange-100 z-10">Download VCF</th>
                        </tr>
                    </thead>
                    <tbody>
                        {counterData && counterData.length > 0 && counterData[0].status !== 404 ?
                            counterData.map((item, index) => (
                                <tr key={index} className="border-t">
                                    <td className="px-4 py-2">{item.projectid}</td>
                                    <td className="px-4 py-2">{item.projectname}</td>
                                    <td className="px-4 py-2">{new Date(parseInt(item.creationtime)).toLocaleString()}</td>
                                    <td className="px-4 py-2">{item.numberofsamples}</td>
                                    <td className="px-4 py-2 cursor-pointer text-blue-400 underline" onClick={() => handleDownloadLink(item.projectid)}>Download Link</td>
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

export default Home