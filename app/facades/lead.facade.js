const LeadService = require('../services/lead.service');
const NinjaQuoterService = require('../services/ninja-quoter.service');
const FormatService = require('../services/format.service');
const MailService = require('../services/mail.service');
const PriceService = require('../services/price.service');
const AutoDiallerService = require('../services/autodialler.service');
const TransformationHelper = require('../helpers/transformation.helper');
const LeadRepository = require('../repository/lead.repository');
const UserRepository = require('../repository/user.repository');

class LeadFacade {
    async createLead(formatedLead, quoter) {
        try {
            const createdLead = await LeadService.createLead(formatedLead);

            if (createdLead.empty == 0) {
                if ("phone" in createdLead) {
                    let guides = await UserRepository.findSuitableWorker("guide");

                    if (guides) {
                        const phone = TransformationHelper.formatPhoneForCall(createdLead.phone);

                        // await AutoDiallerService.outboundCall(phone, createdLead.id);
                    }
                }

                const leadProperty = JSON.parse(createdLead.property);
                const formatedLeadForQuote = FormatService.formatLeadForQuote(leadProperty);
                const ninjaQuoterService = new NinjaQuoterService(formatedLeadForQuote);
                const companies = await ninjaQuoterService.fetchCompanyListFromNinjaQuoter();
                const companiesInfo = ninjaQuoterService.getCompaniesInfo(companies);
                const priceFromQuoter = ninjaQuoterService.getPrice(companies);
                await PriceService.processPrice(createdLead.id, priceFromQuoter, quoter);

                if (companiesInfo.length !== 0) {
                    const email_sended = await LeadService.checkLeadAtSendedEmail(createdLead.email);

                    if (!email_sended) {
                        try {
                            const email_params = {
                                companies: companiesInfo,
                                email: createdLead.email,
                                coverage_amount: leadProperty.coverage_amount,
                                term: leadProperty.term,
                                fullname: createdLead.fullname
                            }

                            email_params.term = email_params.term === 'fex' ? 'final expense' : email_params.term + ' year term';

                            if (typeof email_params.companiesInfo == 'string') {
                                email_params.companiesInfo = JSON.parse(email_params.companiesInfo);
                            }

                            const html = MailService.generateQuotesHtmlTemplate('quote.ejs', email_params);

                            const mail_options = {
                                from: `Blueberry Insurance <${process.env.MAIL_SERVICE_USER_EMAIL}>`,
                                to: email_params.email,
                                subject: `We saved your quote for ${email_params.term} life insurance of $${email_params.coverage_amount}`,
                                html
                            };

                            await MailService.sendNewsletter(mail_options);
                            await LeadService.updateLeadAtSendedEmail(email_params.email, true);
                        } catch (error) {
                            throw error;
                        }
                    }
                }

                return await LeadService.getOne(createdLead.id);
            }

            return await LeadService.getRawLead(createdLead.id);
        } catch (error) {
            throw error;
        }
    }

    async updateLead(exist, formatedLead, quoter) {
        try {
            const updatedLead = await LeadService.updateLead(exist, formatedLead);

            if (updatedLead.empty == 0) {
                const leadProperty = JSON.parse(updatedLead.property);
                const formatedLeadForQuote = FormatService.formatLeadForQuote(leadProperty);
                const ninjaQuoterService = new NinjaQuoterService(formatedLeadForQuote);
                const companies = await ninjaQuoterService.fetchCompanyListFromNinjaQuoter();
                const companiesInfo = ninjaQuoterService.getCompaniesInfo(companies);
                const priceFromQuoter = ninjaQuoterService.getPrice(companies);
                await PriceService.processPrice(updatedLead.id, priceFromQuoter, quoter);

                if (companiesInfo.length !== 0) {
                    const email_sended = await LeadService.checkLeadAtSendedEmail(updatedLead.email);

                    if (!email_sended) {
                        const email_params = {
                            companies: companiesInfo,
                            email: updatedLead.email,
                            coverage_amount: leadProperty.coverage_amount,
                            term: leadProperty.term,
                            fullname: updatedLead.fullname
                        }

                        email_params.term = email_params.term === 'fex' ? 'final expense' : email_params.term + ' year term';

                        if (typeof email_params.companiesInfo == 'string') {
                            email_params.companiesInfo = JSON.parse(email_params.companiesInfo);
                        }

                        const html = MailService.generateQuotesHtmlTemplate('quote.ejs', email_params);

                        const mail_options = {
                            from: `Blueberry Insurance <${process.env.MAIL_SERVICE_USER_EMAIL}>`,
                            to: email_params.email,
                            subject: `We saved your quote for ${email_params.term} life insurance of $${email_params.coverage_amount}`,
                            html
                        };

                        await MailService.sendNewsletter(mail_options);
                        await LeadService.updateLeadAtSendedEmail(email_params.email, true);
                    }
                }

                return await LeadService.getOne(updatedLead.id);
            }

            return await LeadService.getRawLead(updatedLead.id);
        } catch (error) {
            throw error;
        }
    }

    async getGuideLeads() {
        try {
            const leads = await LeadService.getGuideLeads();
            return { code: 200, status: 'success', leads };
        } catch (error) {
            throw error;
        }
    }

    async getAll() {
        try {
            const leads = await LeadService.all();
            return { code: 200, status: 'success', leads };
        } catch (error) {

        }
    }

    async getAllLeads(type, user_id) {
        try {
            const leads = await LeadService.getAll(type, user_id);
            return { code: 200, status: 'success', leads };
        } catch (error) {
            throw error;
        }
    }

    async getRawLeads() {
        try {
            const leads = await LeadService.getRawLeads();
            return { code: 200, status: 'success', leads };
        } catch (error) {
            throw error;
        }
    }

    async getOneLead(lead_id) {
        try {
            const lead = await LeadService.getOne(lead_id);
            return { code: 200, status: 'success', lead };
        } catch (error) {
            throw error;
        }
    }

    async getCompaniesList(rawLead) {
        try {
            const formatedLeadForQuote = FormatService.formatLeadForQuote(rawLead);
            const ninjaQuoterService = new NinjaQuoterService(formatedLeadForQuote);
            const companies = await ninjaQuoterService.fetchCompanyListFromNinjaQuoter();
            const companiesInfo = ninjaQuoterService.getCompaniesInfo(companies);

            return companiesInfo;
        } catch (error) {
            throw error;
        }
    }

    async getLeadsBySource(source) {
        try {
            const leads = await LeadService.getLeadsBySource(source);

            return { code: 200, status: 'success', leads };
        } catch (error) {
            throw error;
        }
    }

    async updateADstatusFields(lead_id, field, status){
        try {  
            const updateStatus = await LeadService.updateADstatusFields(lead_id, field, status);

            if (updateStatus != -1) return { code: 200, status: "success", message: "Status changed" };

            return { code: 404, status: "error", message: "Unexpected error" };
        } catch (error) {
            throw error;
        }
    }

    async getLeadsByFilters(params) {
        try {
            const leads = await LeadService.getLeadsByFilters(params);
            return { code: 200, status: 'success', leads };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new LeadFacade;