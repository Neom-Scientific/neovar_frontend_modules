import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie';
import axios from 'axios';

const Reports = () => {
    const [outputDirs, setOutputDirs] = useState([]);
    const [user, setUser] = useState();
    const [openFolderIdx, setOpenFolderIdx] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dots, setDots] = useState('.');

    useEffect(() => {
        const userData = Cookies.get('neovar_user') || '';
        setUser(JSON.parse(userData));
    }, []);

    useEffect(() => {
        if (!user) return;
        const getOutputDir = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_URL}get-output-dir?email=${user.email}`);
                if (response.status === 200) {
                    setOutputDirs(response.data.outputDirs);
                } else if (response.data[0]?.status === 404) {
                    setOutputDirs([]);
                }
            } catch (error) {
                console.error('API error:', error);
            }
        }
        getOutputDir();
    }, [user]);

    // Animate loading dots
    useEffect(() => {
        if (!loading) return;
        const interval = setInterval(() => {
            setDots(prev => prev.length < 3 ? prev + '.' : '.');
        }, 500);
        return () => clearInterval(interval);
    }, [loading]);

    const allFolders = outputDirs.flatMap(dir =>
        dir.folders.map(folderObj => ({
            outputDir: dir.outputDir,
            folder: folderObj.folder,
            files: folderObj.files
        }))
    );

    const handleFileDownload = async (filePath) => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${process.env.REACT_APP_URL}download-file?filePath=${encodeURIComponent(filePath)}`,
                { responseType: 'blob' }
            );
            const url = window.URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filePath.split('/').pop());
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            setLoading(false);
        } catch (error) {
            alert('Download failed!');
            console.error(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (loading) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [loading]);

    return (
        <div>
            <h1 className='font-bold text-2xl text-orange-500'>Results</h1>
            {allFolders.length > 0 ? (
                <div className='mt-4'>
                    <ul className="list-none ml-0">
                        {allFolders.map((f, idx) => (
                            <li key={idx} className="mb-2 border-b pb-2">
                                <div
                                    className={`cursor-pointer text-sm flex justify-between items-center ${openFolderIdx === idx ? 'font-bold text-orange-600' : ''}`}
                                    onClick={() => setOpenFolderIdx(openFolderIdx === idx ? null : idx)}
                                >
                                    <span className="font-semibold text-xl">{f.folder}</span>
                                    <span className="ml-2">{openFolderIdx === idx ? '▲' : '▼'}</span>
                                </div>
                                {openFolderIdx === idx && (
                                    <ul className="none ml-6 mt-2">
                                        {f.files.map((file, fileIdx) => {
                                            const filePath = `${f.outputDir}/${f.folder}/${file}`;
                                            return (
                                                <li key={fileIdx}>
                                                    <a
                                                        href={`${process.env.REACT_APP_URL}download-file?filePath=${encodeURIComponent(filePath)}`}
                                                        className="text-black font-bold underline"
                                                        download
                                                    >
                                                        {file}
                                                    </a>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <p className='mt-4'>No reports available.</p>
            )}
            {loading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div
                        className="bg-white rounded-lg shadow-lg flex flex-col items-center"
                        style={{ width: '320px', height: '120px', minWidth: '320px', minHeight: '120px', justifyContent: 'center' }}
                    >
                        <span className="text-orange-500 font-semibold text-xl">
                            Preparing download
                            <span style={{ display: 'inline-block', minWidth: '2em' }}>{dots}</span>
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Reports;