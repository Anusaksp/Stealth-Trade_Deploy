import React, { useState, useEffect } from 'react';

export default function Pg() {
  const [folderTree, setFolderTree] = useState([]);
  const [selectedPath, setSelectedPath] = useState([]);
  const [file, setFile] = useState(null);
  
  // 🔴 1. เพิ่ม State สำหรับเก็บชื่อ/รหัสคนส่ง
  const [uploaderName, setUploaderName] = useState(''); 
  
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingFolders, setIsFetchingFolders] = useState(true);

  // 🔴 อย่าลืมเอา URL ของ Web App อันล่าสุดมาวางตรงนี้นะครับ
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwFbo2ayxOQtp0TARLHGbni0QwpneEJkmlGiDOnkCmmxPOCTgtju3TmWFLIfYWxe9JB/exec";

  useEffect(() => {
    fetch(`${SCRIPT_URL}?action=getFolderTree`)
      .then(response => response.text())
      .then(textData => {
        const data = JSON.parse(textData);
        setFolderTree(data);
        setIsFetchingFolders(false);
      })
      .catch(error => {
        console.error('Error fetching folders:', error);
        setStatus({ type: 'error', message: 'ไม่สามารถดึงรายชื่อโฟลเดอร์ได้' });
        setIsFetchingFolders(false);
      });
  }, []);

  const handleDropdownChange = (level, folderId) => {
    const newPath = selectedPath.slice(0, level);
    if (folderId) {
      const optionsForLevel = level === 0 ? folderTree : newPath[level - 1].children;
      const selectedFolder = optionsForLevel.find(f => f.id === folderId);
      newPath.push(selectedFolder);
    }
    setSelectedPath(newPath);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const targetFolder = selectedPath.length > 0 ? selectedPath[selectedPath.length - 1] : null;

  const handleUpload = async (e) => {
    e.preventDefault();

    // 🔴 2. ดักว่ากรอกชื่อหรือยัง
    if (!uploaderName.trim()) {
      setStatus({ type: 'error', message: 'กรุณากรอก รหัส/ชื่อ ผู้ส่งด้วยครับ' });
      return;
    }
    if (!targetFolder) {
      setStatus({ type: 'error', message: 'กรุณาเลือกโฟลเดอร์ปลายทาง' });
      return;
    }
    if (!file) {
      setStatus({ type: 'error', message: 'กรุณาเลือกไฟล์ที่ต้องการอัปโหลด' });
      return;
    }

    setIsLoading(true);
    setStatus({ type: 'info', message: `⏳ กำลังส่งไฟล์ไปที่โฟลเดอร์: ${targetFolder.name}...` });

    const reader = new FileReader();
    reader.onload = async function (event) {
      const base64Data = event.target.result.split(',')[1];
      
      // 🔴 3. แนบชื่อผู้ส่งไปกับก้อนข้อมูล (payload)
      const payload = {
        folderId: targetFolder.id,
        fileName: file.name,
        mimeType: file.type,
        base64: base64Data,
        uploaderName: uploaderName 
      };

      try {
        const response = await fetch(SCRIPT_URL, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload)
        });

        const textData = await response.text();
        const result = JSON.parse(textData);

        if (result.success) {
          setStatus({ type: 'success', message: `✅ ${result.message}` });
          setFile(null);
          // เคลียร์ฟอร์ม
          document.getElementById('fileInput').value = '';
          setUploaderName(''); // ล้างชื่อหลังส่งเสร็จ
        } else {
          setStatus({ type: 'error', message: `❌ ${result.message}` });
        }
      } catch (error) {
        setStatus({ type: 'error', message: `❌ เกิดข้อผิดพลาด: ${error.message}` });
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const renderDynamicDropdowns = () => {
    const dropdowns = [];
    let currentOptions = folderTree;

    for (let i = 0; i <= selectedPath.length; i++) {
      if (!currentOptions || currentOptions.length === 0) break;

      const selectedValue = selectedPath[i] ? selectedPath[i].id : "";
      let label = "เลือก Cycle";
      if (i === 1) label = "เลือกหัวข้องาน";
      if (i > 1) label = `เลือกโฟลเดอร์ย่อย (ชั้นที่ ${i})`;

      dropdowns.push(
        <div key={i} className="mb-3 animate-fade-in">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {i + 1}. {label}
          </label>
          <select
            value={selectedValue}
            onChange={(e) => handleDropdownChange(i, e.target.value)}
            disabled={isFetchingFolders}
            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="">
              {isFetchingFolders ? 'กำลังโหลดข้อมูล...' : '-- กรุณาเลือก --'}
            </option>
            {currentOptions.map(folder => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </select>
        </div>
      );
      currentOptions = selectedPath[i] ? selectedPath[i].children : [];
    }
    return dropdowns;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          📤 ระบบส่งงานเข้า Google Drive
        </h2>

        <form onSubmit={handleUpload} className="space-y-5">
          
          {/* 🔴 4. เพิ่มช่องกรอก รหัส/ชื่อ ผู้ส่ง */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              👤 รหัส/ชื่อ ผู้อัปโหลด
            </label>
            <input
              type="text"
              value={uploaderName}
              onChange={(e) => setUploaderName(e.target.value)}
              placeholder="เช่น 67160XXX"
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            {renderDynamicDropdowns()}
            {targetFolder && (
              <div className="mt-4 p-3 bg-blue-50 text-blue-700 text-sm rounded-lg border border-blue-200 shadow-sm">
                📌 <strong>ปลายทางปัจจุบัน:</strong> {targetFolder.name}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              เลือกไฟล์แนบ
            </label>
            <input
              id="fileInput"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.mp4,.mov"
              className="w-full border border-gray-300 rounded-lg p-2 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || isFetchingFolders || !targetFolder}
            className={`w-full text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-sm ${
              isLoading || isFetchingFolders || !targetFolder ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'กำลังส่งข้อมูล...' : 'ส่งไฟล์'}
          </button>
        </form>

        {status.message && (
          <div className={`mt-4 p-4 rounded-xl text-sm text-center font-medium shadow-sm ${
            status.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' :
            status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-blue-50 text-blue-700 border border-blue-100'
          }`}>
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
}