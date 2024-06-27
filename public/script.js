document.addEventListener('DOMContentLoaded', () => {
    // Initialize variables for user inputs for the header
    let name1 = '';
    let phoneNumber = '';
    let address = '';
    let linkedIn = '';
    let email = '';
    let resume = '';
    let template = '';
    let instructions = '';

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
        instructions = document.getElementById('additionalInstructions').value;

        const jobDescription = document.getElementById('jobDescription').value;
        console.log(instructions);

        const input = ('\nThese are the specific instructions for the cover letter from the user \n\n' + instructions + 'The name of the user that you are generating a cover letter for is ' + name1 + '\n\nJob description \n\n' + jobDescription + '\n\nresume \n\n' + resume + '\n\n cover letter template\n\n' + template);

        try {
            const coverLetter = await fetchCoverLetter(input);  // Fetch cover letter
            displayCoverLetter(coverLetter);  // Display cover letter

            const { companyName, jobRole } = await fetchCompanyNameAndRole(jobDescription);  // Fetch company name and job role
            const filename = `${companyName} ${jobRole} Cover Letter.pdf`;  // Create filename
            setDownloadFilename(filename);  // Set filename for download
        } catch (error) {
            console.error('Error:', error);  // Log any errors
        }
    }

    // Function to fetch cover letter
    async function fetchCoverLetter(input) {
        const response = await fetch('/generate-cover-letter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ jobDescription: input }) // Ensure correct field name
        });

        if (!response.ok) {  // Handle non-OK response
            throw new Error('Failed to fetch cover letter');
        }

        const data = await response.json();  // Parse response JSON
        return data.coverLetter;  // Return cover letter
    }

    // Function to display cover letter
    function displayCoverLetter(coverLetter) {
        const outputDiv = document.getElementById('output');  // Get output div
        outputDiv.style.display = 'block';  // Show output div

        const coverLetterPre = document.getElementById('coverLetter');  // Get cover letter element
        coverLetterPre.textContent = coverLetter;  // Set cover letter text
    }

    // Function to fetch company name and role
    async function fetchCompanyNameAndRole(jobDescription) {
        console.log('Fetching company name and role for:', jobDescription); // Debug log
        const response = await fetch('/get-company-name', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ jobDescription: jobDescription })
        });

        if (!response.ok) {
            console.error('Failed to fetch company name and role:', response.status, response.statusText); // Debug log
            throw new Error('Failed to fetch company name and role');
        }

        const data = await response.json();

        const companyName = data.companyName;
        const jobRole = data.jobRole.substring(data.jobRole.length - 2);

        console.log('Fetched data:', data); // Debug log
        console.log('more data ' + data.companyName + " " + data.jobRole);

        return { companyName, jobRole };
    }

    // Function to set download filename
    function setDownloadFilename(filename) {
        const downloadButton = document.getElementById('downloadPdf');  // Get download button
        downloadButton.setAttribute('data-filename', filename);  // Set data-filename attribute
    }

    document.getElementById('downloadPdf').addEventListener('click', async () => {
        try {
            const { jsPDF } = window.jspdf;
            const coverLetter = document.getElementById('coverLetter').textContent;

            const doc = new jsPDF();
            const maxWidth = 165; // Adjust as needed for your layout
            const textLines = doc.splitTextToSize("\n\n\n\n\n" + coverLetter, maxWidth);
            const marginLeft = 20;
            const marginTop = 20;
            
            const nameLine = name1 + '\n';
            const lineTwo = phoneNumber + ' | ' + email + ' | ' + address + '\n' + linkedIn;

            // Create a new Date object (automatically initialized with current date and time)
            const today = new Date();

            // Extract individual components of the date
            const year = today.getFullYear(); // Full year (e.g., 2024)
            const month = today.getMonth() + 1; // Month (0-11, so we add 1)
            const day = today.getDate(); // Day of the month (1-31)

            if (document.getElementById('generateHeaderCheckbox').checked) {
                doc.setFont('Courier', 'Bold');
                doc.setFontSize(22);
                doc.text(nameLine, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
                doc.setFontSize(12);
                doc.setFont('Courier', '');
                doc.text(lineTwo, doc.internal.pageSize.getWidth() / 2, 26, { align: 'center' });
            }

            doc.setFontSize(12);
            doc.setFont('Courier', '');

            doc.text("\n" + month + "/" + day + "/" + year + "\n\n" + "Dear Hiring Manager,\n\n", marginLeft, 40);
            doc.text(textLines, marginLeft, 40);

    
            const jobDescription = document.getElementById('jobDescription').value;
    
            // Fetch company name and job role
            const response = await fetch('/get-company-name', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ jobDescription })
            });
    
            if (!response.ok) {
                throw new Error('Failed to fetch company name and role');
            }
    
            const { companyName, jobRole } = await response.json();
    
            if (companyName && jobRole) {
                console.log('Company name and job role:', companyName, jobRole); // Debug log
                const filename = `${companyName} ${jobRole.slice(0, -2)} Cover Letter.pdf`;
                doc.save(filename);
            } else {
                console.error('Company name or job role is undefined');
            }
    
        } catch (error) {
            console.error('Error:', error);
        }
    });

    // Collapsible menu for personal information
    var coll = document.getElementById("personalInformationCollapsable");
    coll.addEventListener("click", function () {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.maxHeight) {
            content.style.maxHeight = null;
        } else {
            content.style.maxHeight = content.scrollHeight + "px";
        }
    });

    // Handle the extra information after the generate header checkbox
    var extraInformation = document.getElementById("two-columns");
    var checkbox = document.getElementById('generateHeaderCheckbox');

    checkbox.addEventListener("click", function () {
        if (checkbox.checked) {
            extraInformation.style.maxHeight = 'none';
        } else {
            extraInformation.style.maxHeight = '0';
        }
    });

    var coll = document.getElementById("customizationOptions");
    coll.addEventListener("click", function () {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.maxHeight) {
            content.style.maxHeight = null;
        } else {
            content.style.maxHeight = content.scrollHeight + "px";
        }
    });

    document.getElementById('jobForm').addEventListener('submit', handleFormSubmit);  // Add event listener for form submission
});
