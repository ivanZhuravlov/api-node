const client = require('socket.io-client')(process.env.WEBSOCKET_URL);
const jwt = require('jsonwebtoken');

const FormatService = require('../services/format.service');
const LeadService = require('../services/lead.service');
const NinjaQuoterService = require('../services/ninja-quoter.service');
const MailService = require('../services/mail.service');

async function test(req, res) {
    const lead = await FormatService.formatLead(req.body);
    return res.status(200).send(lead);
}

async function getLeads(req, res) {
    try {
        const leads = await LeadService.getAll(req.params.type, req.params.user_id);

        return res.status(200).json({ status: "success", leads });
    } catch (err) {
        res.status(500).json({ status: 'error', message: "Server Error!" });
        throw err;
    }
}

async function getRawLeads(req, res) {
    try {
        const rawLeads = await LeadService.getRawLeads();
        return res.status(200).json({ status: "success", rawLeads });
    } catch (err) {
        res.status(500).json({ status: 'error', message: "Server Error" });
        throw err;
    }
}

async function getLead(req, res) {
    try {
        const lead = await LeadService.getOne(req.params.lead_id);
        return res.status(200).json({ status: "success", lead });
    } catch (err) {
        res.status(500).json({ status: 'error', message: "Server Error" });
        throw err;
    }
}

async function getCompaniesListByLeadData(req, res) {
    const rawLead = JSON.parse(JSON.stringify(req.body));

    rawLead.medications = rawLead['medications[]'];

    if ("medications" in rawLead) {
        delete rawLead['medications[]']
    }

    client.emit("process-lead", rawLead);

    try {
        const formatedLeadForQuote = await FormatService.formatLeadForQuote(rawLead);

        const quotes = new NinjaQuoterService(formatedLeadForQuote);

        const companies = await quotes.getCompaniesInfo();

        return res.status(200).json(companies);
    } catch (err) {
        res.status(500).json({ status: 'error', message: "Server Error" });
        throw err;
    }
}

async function uploadLeadFromUrl(req, res) {
    try {
        const urlData = req.body;
        let rawLead = {};

        if ("phone" in urlData) {
            rawLead.phone = urlData.phone;
        } else {
            throw new Error('Missed phone number, we use phone number for all opertion, so it`s required field.');
        }

        rawLead = {
            agent: null,
            type: urlData.type,
            source: "blueberry",
            empty: 1
        };

        if ("first_name" in urlData && "last_name" in urlData) {
            rawLead.fname = urlData.first_name;
            rawLead.lname = urlData.last_name;
        }

        if ("phone" in urlData) {
            rawLead.phone = urlData.phone;
        }

        if ("email" in urlData) {
            rawLead.email = urlData.email;
        }

        if ("zip" in urlData) {
            rawLead.zip = urlData.zip;
        }

        if ("dob" in urlData) {
            rawLead.birth_date = urlData.dob;
        }

        console.log("uploadLeadFromUrl -> rawLead", rawLead)

        client.emit("process-lead", rawLead);

        return res.status(200).json({ status: 'success', message: 'Lead Uploaded' });
    }
    catch (err) {
        res.status(500).json({ status: 'error', message: "Server Error" });
        throw err;
    }
}

async function uploadLeadFromMediaAlpha(req, res) {
    try {
        const rawLead = req.body;

        const preparedLead = {
            source: "mediaalpha",
            type: rawLead.type,
            empty: 0,
            ...rawLead.lead
        };

        client.emit("process-lead", preparedLead);

        return res.status(200).json({ status: "success", message: "Success Uploaded!" });
    } catch (err) {
        res.status(500).json({ status: 'error', message: "Server Error" });
        throw err;
    }

}

async function getBlueberryLeads(req, res) {
    try {
        const leads = await LeadService.blueberryLeads();
        return res.status(200).json({ status: "success", leads });
    } catch (err) {
        res.status(500).json({ status: 'error', message: "Server Error" });
        throw err;
    }
}

async function getMediaAlphaLeads(req, res) {
    try {
        const leads = await LeadService.mediaAlphaLeads();
        return res.status(200).json({ status: "success", leads });
    } catch (err) {
        res.status(500).json({ status: 'error', message: "Server Error" });
        throw err;
    }
}

module.exports = {
    test,
    getLead,
    getLeads,
    getRawLeads,
    getCompaniesListByLeadData,
    uploadLeadFromMediaAlpha,
    uploadLeadFromUrl,
    getBlueberryLeads,
    getMediaAlphaLeads
}   