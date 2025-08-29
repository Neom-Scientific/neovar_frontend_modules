import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import path from 'path-browserify';
import Cookies from 'js-cookie';
import { toast, ToastContainer } from 'react-toastify';
import ProjectAnalysis from './ProjectAnalysis';

const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB

function NewProject() {
  // const [uploadProgress, setUploadProgress] = useState(0);
  const [sampleIds, setSampleIds] = useState([]);
  const [testName, setTestName] = useState('');
  const [email, setEmail] = useState('');
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [fileProgress, setFileProgress] = useState({});
  const [selectedFiles, setSelectedFiles] = useState({});
  const [fileSpeed, setFileSpeed] = useState({});
  const [showAnalysis, setShowAnalysis] = useState(false);
  const fileUploadStats = useRef({});

  useEffect(() => {
    const user = Cookies.get('neovar_user') || '';
    const email = JSON.parse(user).email;
    setEmail(email);
  }, []);

  const cleanId = (id) => {
    if (!id) return '';
    return id
      .toString()
      .trim()
      .normalize()
      .replace(/(_R[12]|_[12])$/, '');
  };

  const extractBaseName = (fileName) => {
    let baseName = path.basename(fileName).replace(/\.(fastq|fq)(\.gz)?$/i, '');
    baseName = cleanId(baseName);
    return baseName;
  };

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

    const ids = sheetData
      .map(row => cleanId(row['Sample ID']))
      .filter(Boolean);

    setSampleIds(ids);

    toast.success(`Excel loaded with ${ids.length} Sample IDs`);
    // alert(`Excel loaded with ${ids.length} Sample IDs`);
  };

  // Limit the number of concurrent promises
  async function promisePool(tasks, poolLimit = 25) {
    const results = [];
    const executing = [];
    for (const task of tasks) {
      const p = Promise.resolve().then(() => task());
      results.push(p);

      if (poolLimit <= tasks.length) {
        const e = p.then(() => executing.splice(executing.indexOf(e), 1));
        executing.push(e);
        if (executing.length >= poolLimit) {
          await Promise.race(executing);
        }
      }
    }
    return Promise.all(results);
  }

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files.map(f => f.name)); // Store all file names
    setFileProgress(files.reduce((acc, f) => ({ ...acc, [f.name]: 0 }), {}));
    setFileSpeed(files.reduce((acc, f) => ({ ...acc, [f.name]: 0 }), {}));
    fileUploadStats.current = {};
    files.forEach(file => {
      fileUploadStats.current[file.name] = {
        lastTime: Date.now(),
        lastLoaded: 0,
        totalLoaded: 0
      };
    });
    let sessionId = new Date().toLocaleString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).replace(/[/, ]/g, '-').replace(/:/g, '-');
    const uploadedFiles = [];
    if (testName === '') {
      // alert('Please select a test name before uploading files');
      toast.error('Please select a test name before uploading files');
      return;
    }
    sessionId = sessionId + '-' + email;

    const validProcess = await axios.get(`${process.env.REACT_APP_URL}start-project?email=${encodeURIComponent(email)}`);

    // console.log('validProcess:', validProcess);
    if (validProcess.data.status === 400) {
      toast.error(validProcess.data.message);
      return;
    }

    if (validProcess.status === 200) {
      //   await Promise.all(files.map(async (file) => {
      //     if (/\.(fastq|fq)(\.gz)?$/i.test(file.name)) {
      //       const baseName = extractBaseName(file.name);
      //       const matched = sampleIds.some(id => cleanId(id) === baseName);

      //       if (!matched) {
      //         // alert(`❌ FASTQ file "${file.name}" not found in Excel's "Sample ID" column`);
      //         toast.error(`FASTQ file "${file.name}" not found in Excel's "Sample ID" column`);
      //         return;
      //       }
      //     }

      //     let lastTime = Date.now();
      //     let lastLoaded = 0;
      //     const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

      //     for (let i = 0; i < totalChunks; i++) {
      //       const start = i * CHUNK_SIZE;
      //       const end = Math.min(start + CHUNK_SIZE, file.size);
      //       const chunk = file.slice(start, end);

      //       const formData = new FormData();
      //       formData.append('chunk', chunk);
      //       formData.append('sessionId', sessionId);
      //       formData.append('projectName', projectName);
      //       formData.append('chunkIndex', i);
      //       formData.append('fileName', file.name);

      //       setShowProgressModal(true);
      //       await axios.post(
      //         `${process.env.REACT_APP_URL}upload?sessionId=${sessionId}&chunkIndex=${i}&fileName=${encodeURIComponent(file.name)}&projectName=${encodeURIComponent(projectName)}&email=${encodeURIComponent(email)}`,
      //         formData,
      //         {
      //           headers: { 'Content-Type': 'multipart/form-data' },
      //           timeout: 600000, // 10 minutes per chunk
      //           onUploadProgress: (progressEvent) => {
      //             // Calculate total loaded for this file
      //             const stats = fileUploadStats.current[file.name];
      //             const now = Date.now();
      //             // progressEvent.loaded is for this chunk, so add to totalLoaded
      //             const chunkLoaded = (i * CHUNK_SIZE) + progressEvent.loaded;
      //             const timeDiff = (now - stats.lastTime) / 1000; // seconds
      //             const bytesDiff = chunkLoaded - stats.lastLoaded;
      //             if (timeDiff > 0) {
      //               const speed = bytesDiff / timeDiff; // bytes per second
      //               setFileSpeed(prev => ({
      //                 ...prev,
      //                 [file.name]: speed
      //               }));
      //               stats.lastTime = now;
      //               stats.lastLoaded = chunkLoaded;
      //             }
      //             const percent = Math.round(
      //               ((i + progressEvent.loaded / progressEvent.total) / totalChunks) * 100
      //             );
      //             setFileProgress(prev => ({
      //               ...prev,
      //               [file.name]: percent
      //             }));
      //           }
      //         }
      //       );
      //     }

      //     uploadedFiles.push(file.name);
      //   }));

      //   await axios.post(`${process.env.REACT_APP_URL}merge`, {
      //     sessionId,
      //     fileNames: uploadedFiles,
      //     testName,
      //     email,
      //     numberOfSamples: sampleIds.length,
      //     projectName,
      //   });

      //   localStorage.setItem('sessionId', sessionId);
      //   setShowAnalysis(true);
      //   setShowProgressModal(false);
      //   toast.success('All valid files uploaded and merged successfully!');
      //   // alert('✅ All valid files uploaded and merged!');
      // }
      if (validProcess.status === 200) {
        // Create an array of upload tasks (functions)
        const uploadTasks = files.map(file => async () => {
          if (/\.(fastq|fq)(\.gz)?$/i.test(file.name)) {
            const baseName = extractBaseName(file.name);
            const matched = sampleIds.some(id => cleanId(id) === baseName);

            if (!matched) {
              toast.error(`FASTQ file "${file.name}" not found in Excel's "Sample ID" column`);
              return;
            }
          }

          let lastTime = Date.now();
          let lastLoaded = 0;
          const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

          for (let i = 0; i < totalChunks; i++) {
            const start = i * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, file.size);
            const chunk = file.slice(start, end);

            const formData = new FormData();
            formData.append('chunk', chunk);
            formData.append('sessionId', sessionId);
            formData.append('projectName', projectName);
            formData.append('chunkIndex', i);
            formData.append('fileName', file.name);

            setShowProgressModal(true);
            await axios.post(
              `${process.env.REACT_APP_URL}upload?sessionId=${sessionId}&chunkIndex=${i}&fileName=${encodeURIComponent(file.name)}&projectName=${encodeURIComponent(projectName)}&email=${encodeURIComponent(email)}`,
              formData,
              {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 600000, // 10 minutes per chunk
                onUploadProgress: (progressEvent) => {
                  const stats = fileUploadStats.current[file.name];
                  const now = Date.now();
                  const chunkLoaded = (i * CHUNK_SIZE) + progressEvent.loaded;
                  const timeDiff = (now - stats.lastTime) / 1000;
                  const bytesDiff = chunkLoaded - stats.lastLoaded;
                  if (timeDiff > 0) {
                    const speed = bytesDiff / timeDiff;
                    setFileSpeed(prev => ({
                      ...prev,
                      [file.name]: speed
                    }));
                    stats.lastTime = now;
                    stats.lastLoaded = chunkLoaded;
                  }
                  const percent = Math.round(
                    ((i + progressEvent.loaded / progressEvent.total) / totalChunks) * 100
                  );
                  setFileProgress(prev => ({
                    ...prev,
                    [file.name]: percent
                  }));
                }
              }
            );
          }

          uploadedFiles.push(file.name);
        });

        // Use the pool with a concurrency limit (e.g., 2)
        await promisePool(uploadTasks, 2);

        await axios.post(`${process.env.REACT_APP_URL}merge`, {
          sessionId,
          fileNames: uploadedFiles,
          testName,
          email,
          numberOfSamples: sampleIds.length,
          projectName,
        });

        localStorage.setItem('sessionId', sessionId);
        setShowAnalysis(true);
        setShowProgressModal(false);
        toast.success('All valid files uploaded and merged successfully!');
      }
    }
  };

  if (showAnalysis) {
    return <ProjectAnalysis />;
  }

  return (
    <div className="mx-auto py-8 px-4">
      <label className="block text-lg font-semibold mb-2">Project Name</label>
      <input
        className="w-1/2 mb-6 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
        type="text"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        placeholder="Project Name"
      />
      <div className='flex flex-col md:flex-row gap-4'>
        <div className='w-full'>
          <label className="block text-xl font-bold mb-2">Upload Excel Sheet</label>
          <input
            className="w-full mb-1 px-4 py-1 border rounded"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleExcelUpload}
          />
          <div className="text-sm text-gray-600 mb-6">Supported formats: .xls, .xlsx</div>
        </div>
        <div className="w-full flex flex-col items-start">
          <span className="block text-xl font-bold mb-2">Download Sheet Format</span>
          <a href='/downloads/nipt.xls' className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded">
            Download Excel File
          </a>
        </div>
      </div>

      <label className="block text-xl font-bold mb-2">Select the Type of Test</label>
      <select
        className="w-1/2 mb-6 px-4 py-2 border rounded bg-gray-100"
        onChange={(e) => setTestName(e.target.value)}
        value={testName}
      >
        <option value=''>Select Test Type</option>
        <option value='exome'>Exome</option>
        <option value='carrier'>Carrier</option>
        <option value='clinical'>Clinical</option>
      </select>

      <label className="block text-xl font-bold mb-2">Upload Files</label>
      <input
        className="w-1/2 mb-1 px-4 py-1 border rounded"
        type="file"
        accept='.fastq,.fq ,.fastq.gz,.fq.gz '
        multiple
        onChange={handleFileUpload}
      />
      <div className="text-sm text-gray-600 mb-6">Accepted: .fastq, .fq, .fastq.gz, .fq.gz</div>


      {/* <button
        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded"
        onClick={() => alert('Start Analysis')}
      >
        Start Analysis
      </button> */}

      {/* Table */}
      <div className="mt-12">
        <table className="min-w-full border-t">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Library Id</th>
              <th className="px-4 py-2 text-left">Sample ID</th>
            </tr>
          </thead>
          <tbody>
            {sampleIds.map((id, index) => (
              <tr key={index}>
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{id}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-center text-sm text-gray-600 mt-2">Check the Sheet Data</div>
      </div>
      {showProgressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md flex flex-col items-center">
            <span className="text-lg font-semibold mb-4">Uploading Files...</span>
            <div className="w-full space-y-4">
              {Object.entries(fileProgress).map(([name, percent]) => (
                <div key={name} className="mb-2">
                  <div className="text-sm font-medium mb-1">{name}</div>
                  <progress className="w-full" value={percent} max="100" />
                  <span className="text-xs ml-2">{percent}%</span>
                  <span className="text-xs ml-2 text-gray-500">
                    {(fileSpeed[name] / 1024).toFixed(1)} KB/s
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}

export default NewProject;