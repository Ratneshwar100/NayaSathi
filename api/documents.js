const express = require('express');
const router = express.Router();

router.post('/generate', (req, res) => {
    try {
        const { type, name, address, description, date } = req.body;
        let documentContent = "";

        if (type === 'FIR') {
            documentContent = `
To,
The Officer-in-Charge,
Police Station: ______________
Date: ${date || new Date().toLocaleDateString()}

Subject: First Information Report (FIR)

Respected Sir/Madam,
I, ${name || '[Your Name]'}, residing at ${address || '[Your Address]'}, would like to report the following incident:
${description || '[Write description here...]'}

Please register my complaint and take necessary legal actions.

Sincerely,
${name || '[Your Name]'}
            `;
        } else if (type === 'COMPLAINT') {
            documentContent = `
To,
The Competent Authority,
Date: ${date || new Date().toLocaleDateString()}

Subject: Formal Complaint

Respected Sir/Madam,
I, ${name || '[Your Name]'}, residing at ${address || '[Your Address]'}, wish to formally complain about:
${description || '[Write description here...]'}

Kindly look into the matter and assist me in getting justice.

Sincerely,
${name || '[Your Name]'}
            `;
        } else {
             documentContent = `
SUBJECT: APPLICATION

From: ${name || '[Your Name]'}
Address: ${address || '[Your Address]'}
Date: ${date || new Date().toLocaleDateString()}

${description || '[Write description here...]'}

Regards,
${name || '[Your Name]'}
            `;
        }

        res.json({ success: true, document: documentContent.trim() });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
