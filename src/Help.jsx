import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import Cookies from 'js-cookie';

const Help = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(()=>{
    const userData = Cookies.get('neovar_user');
    if(userData){
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    }
  })

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query) {
      toast.error('Please enter your query.');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_URL}send-help-query`, {
        email: user?.email,
        message: query,
        name: user?.name || 'User',
        subject: 'Help Query from NeoVar User'
      });
      toast.success('Your query has been sent!');
      setQuery('');
    } catch (err) {
      toast.error('Failed to send query. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className=" max-w-5xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-4">Help & FAQ</h2>
      <div className="mb-8">
        <h3 className="font-semibold mb-2">What is the NeoVar? What does it do?</h3>
        <p className="mb-4">
NeoVar is to streamline and automate the conversion of raw sequencing data files — including .fastq, .fastq.gz, .fq, and .fq.gz formats — into high-quality Variant Call Format (VCF) files. This tool is specifically designed to support genomic testing workflows such as Whole Exome Sequencing (WES), Clinical Exome, and Carrier Screening.</p>
        <h3 className="font-semibold mb-2">How do I upload files?</h3>
        <p className="mb-4">Go to the New Project tab , fill the details , and upload your Excel and .fastq files</p>
        <img src = './newproject.png' className='border border-black'/>
        <h3 className="font-semibold my-2">What is the format of Excel?</h3>
        <p className='mb-4'>
          The Excel file should contain the <b>Serial No</b> and <b>Sample ID</b> columns. The Serial No column should contain the sequence of the samples, and the Sample ID column should contain the fastq file names without extensions. For example, if the fastq file name is <b>sample1_R1.fastq.gz</b>, the Sample ID should be <b>sample1</b>.For sample's R1 and R2 files add only one entry in the excel sheet
        </p>
        <h3 className="font-semibold my-2">How do I download results?</h3>
        <p className="mb-4">In the Home Tab you can see your projects and with the "Download VCF" button. On click of the button the files are being started downloading.</p>
        <img src = './hometab.png' className='border border-black'/>

        <h3 className='font-semibold my-2'>How the processing will be shown?</h3>
        <p className='mb-4'>In the Project Analysis tab you can see the progress of your current running project and all other projects which are previously completed.</p>
        <img src = './projectanalysis.png' className='border border-black'/>
        <h3 className='font-semibold my-2'>Do's and Don'ts</h3>
        <ul className='list-disc list-inside mb-4'>
        <li>
  {"While Creating the project ensure that always move from top to bottom. Like first add the project name > add excel > select test name > add fastq files"}
</li>
<li>Do not add more than 25 samples in a single project.</li>
<li>While one project is running do not run another project.</li>
<li>Ensure that the Excel file is correctly formatted with the required columns.</li>
<li>Make sure that the Sample IDs in the Excel file exactly match the names of the uploaded .fastq files (excluding extensions).</li>
<li>Ensure that the excel file is in .xls or .xlsx and the fastq file in .fastq ,.fastq.gz ,.fq ,.fq.gz</li>
<li>Ensure that both R1 and R2 files for each sample are uploaded.</li>
<li>Check your Internet connection before starting the project.</li>

        </ul>
      </div>
      <form onSubmit={handleSubmit} className="bg-orange-50 p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Send us your query</h3>
        <textarea
          className="w-full mb-2 px-3 py-2 border rounded"
          placeholder="Type your query here..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          rows={4}
          required
        />
        <button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Query'}
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default Help;