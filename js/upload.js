// File Upload Functionality

const uploadBox = document.getElementById('upload-box');
const fileInput = document.getElementById('file-input');

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    uploadBox.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Highlight drop zone when item is dragged over it
['dragenter', 'dragover'].forEach(eventName => {
    uploadBox.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    uploadBox.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
    uploadBox.classList.add('dragover');
}

function unhighlight(e) {
    uploadBox.classList.remove('dragover');
}

// Handle dropped files
uploadBox.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

// Handle file input selection
fileInput.addEventListener('change', function(e) {
    handleFiles(this.files);
});

// Store uploaded files
let uploadedFiles = [];

// Create modal for PDF preview
const previewModal = document.createElement('div');
previewModal.className = 'pdf-preview-modal';
previewModal.innerHTML = `
    <div class="modal-content">
        <span class="close-modal">&times;</span>
        <iframe id="pdf-viewer"></iframe>
    </div>
`;
document.body.appendChild(previewModal);

// Close modal when clicking the close button or outside the modal
const closeBtn = previewModal.querySelector('.close-modal');
closeBtn.onclick = () => previewModal.style.display = 'none';
window.onclick = (event) => {
    if (event.target === previewModal) {
        previewModal.style.display = 'none';
    }
};

function handleFiles(files) {
    // Convert FileList to Array for easier processing
    Array.from(files).forEach(file => {
        // Validate file type
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            alert(`File ${file.name} is not a PDF file`);
            return;
        }
        
        // Validate file size (100MB)
        if (file.size > 100 * 1024 * 1024) {
            alert(`File ${file.name} exceeds 100MB limit`);
            return;
        }

        // Add file to the list if not already present
        if (!uploadedFiles.some(f => f.name === file.name)) {
            uploadedFiles.push(file);
        }
    });
    
    updateFileList();
}

function updateFileList() {
    // Get or create the file list container
    let fileListContainer = document.querySelector('.file-list');
    if (!fileListContainer) {
        fileListContainer = document.createElement('div');
        fileListContainer.className = 'file-list';
        document.querySelector('.upload-container').appendChild(fileListContainer);
    }

    // Clear existing list
    fileListContainer.innerHTML = '';

    // Create list items for each file
    uploadedFiles.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.dataset.fileIndex = index;
        fileItem.innerHTML = `
            <span class="file-name" role="button" title="Click to preview">${file.name}</span>
            <div class="file-actions">
                <button class="preview-btn" title="Preview PDF" aria-label="Preview PDF">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="delete-btn" title="Remove file" aria-label="Delete file">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        fileItem.querySelector('.file-name').style.cursor = 'pointer';
        
        const deleteBtn = fileItem.querySelector('.delete-btn');
        const previewBtn = fileItem.querySelector('.preview-btn');
        const fileName = fileItem.querySelector('.file-name');
        
        fileName.addEventListener('click', () => previewFile(file));
        previewBtn.addEventListener('click', () => previewFile(file));
        
        deleteBtn.addEventListener('click', (e) => {
            const itemToRemove = e.target.closest('.file-item');
            const indexToRemove = parseInt(itemToRemove.dataset.fileIndex);
            removeFile(indexToRemove);
        });
        
        fileListContainer.appendChild(fileItem);
    });
}

function removeFile(index) {
    if (index >= 0 && index < uploadedFiles.length) {
        uploadedFiles.splice(index, 1);
        updateFileList();
    }
}

function previewFile(file) {
    const fileURL = URL.createObjectURL(file);
    const pdfViewer = document.getElementById('pdf-viewer');
    pdfViewer.src = fileURL;
    previewModal.style.display = 'block';
    
    // Clean up the object URL when the modal is closed
    const cleanup = () => {
        previewModal.style.display = 'none';
        URL.revokeObjectURL(fileURL);
    };

    closeBtn.onclick = cleanup;
    previewModal.onclick = (event) => {
        if (event.target === previewModal) {
            cleanup();
        }
    };
}