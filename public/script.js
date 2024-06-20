document.addEventListener('DOMContentLoaded', () => {
    // Handle form submission
    document.getElementById('jobForm').addEventListener('submit', handleFormSubmit);

    // Handle PDF download
    document.getElementById('downloadPdf').addEventListener('click', generatePDF);
});

// Initialize variables for user inputs for the header
let name1 = '';
let phoneNumber = '';
let address = '';
let linkedIn = '';
let email = '';
let resume = '';
let template = '';

// Function to handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();  // Prevent default form submission
    
    // Get the user inputs for the header
    name1 = document.getElementById('name').value;
    phoneNumber = document.getElementById('phoneNumber').value;
    address = document.getElementById('address').value;
    linkedIn = document.getElementById('linkedIn').value;
    email = document.getElementById('email').value;
    resume = document.getElementById('resume').value;
    template = document.getElementById('letterTemplate').value;

    const jobDescription = document.getElementById('jobDescription').value;  // Get job description

    const input = ('Job description \n\n' + jobDescription + '\n\nresume \n\n' + resume + '\n\n cover letter template\n\n' + template);

    try {
        const coverLetter = await fetchCoverLetter(input);  // Fetch cover letter
        displayCoverLetter(coverLetter);  // Display cover letter

        const { companyName, jobRole } = await fetchCompanyNameAndRole(jobDescription);  // Fetch company name and job role
        const filename = `${companyName} ${jobRole} Cover Letter.pdf`;  // Construct filename
        setDownloadFilename(filename);  // Set filename for download

    } catch (error) {
        console.error('Error fetching or processing data:', error);  // Log errors
        document.getElementById('coverLetter').textContent = "Error generating";  // Display error message
    }
}

// Function to fetch cover letter from the server
async function fetchCoverLetter(jobDescription) {
    const response = await fetch('/generate-cover-letter', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ jobDescription })  // Send job description
    });

    if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();  // Parse JSON response
    return data.coverLetter;  // Return cover letter
}

// Function to display cover letter
function displayCoverLetter(coverLetter) {
    document.getElementById('coverLetter').textContent = "Dear Hiring Manager, \n\n" + coverLetter;  // Display cover letter
    document.getElementById('output').style.display = 'block';  // Show output section
}

// Function to fetch company name and job role from the server
async function fetchCompanyNameAndRole(jobDescription) {
    const response = await fetch('/get-company-name', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ jobDescription })  // Send job description
    });

    if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();  // Parse JSON response
    const generatedText = data.generatedText.replace(/\n/g, "");  // Remove newlines
    const [companyName, jobRole] = generatedText.split(' ');  // Split text to get company name and job role

    return { companyName, jobRole };  // Return company name and job role
}

// Function to set the filename for the PDF download
function setDownloadFilename(filename) {
    document.getElementById('downloadPdf').setAttribute('download', filename);  // Set download attribute
}

// Function to generate and download the PDF
async function generatePDF() {
    try {
        const { jsPDF } = window.jspdf;  // Get jsPDF library
        const coverLetter = document.getElementById('coverLetter').textContent;  // Get cover letter content

        const doc = new jsPDF();
        const maxWidth = 220;  // Maximum width for text
        const textLines = doc.splitTextToSize("\n" + coverLetter, maxWidth);  // Split text into lines
        const marginLeft = 20;
        const marginTop = 20;

        // Read the text file (Note: Ensure this part is correct based on your setup)
        const text = '/fontText.txt'; // This should be a valid path to your font file
        // Base64 encoded font data (this part seems unrelated to the issue)
        var font = text;
        // Function to add font to jsPDF (this part seems unrelated to the issue)
        var callAddFont = function () {
            this.addFileToVFS('EBGaramond-Regular-normal.ttf', font);
            this.addFont('EBGaramond-Regular-normal.ttf', 'EBGaramond-Regular', 'normal');
        };
        // Push font adding function to jsPDF events (this part seems unrelated to the issue)
        jsPDF.API.events.push(['addFonts', callAddFont]);
        doc.setFont('EBGaramond-Regular', 'normal');
        doc.setFontSize(20);

        // Add content to PDF
        doc.text(name1, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
        doc.setFontSize(12);
        const secondHeaderLine = `${phoneNumber} | ${email} | ${address}`;
        doc.text(secondHeaderLine, doc.internal.pageSize.getWidth() / 2, 26, { align: 'center' });
        doc.text(`Linkedin: ${linkedIn}`, doc.internal.pageSize.getWidth() / 2, 32, { align: 'center' });

        // Add current date
        const today = new Date();
        const formattedDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
        doc.text(formattedDate, marginLeft, 42);

        // Add cover letter text
        doc.text(textLines, marginLeft, 50);

        // Save the PDF with the specified filename
        const filename = document.getElementById('downloadPdf').getAttribute('download');
        doc.save(filename);
    } catch (error) {
        console.error('Error generating PDF:', error);
        // Handle error appropriately, such as displaying an error message to the user
    }
}

