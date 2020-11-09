const db = require('../../database/models');
const TransformationHelper = require('../helpers/transformation.helper');

const LeadRepository = {
    async All() {
        try {
            let data = await db.sequelize.query(`SELECT * FROM leads ORDER BY leads.id DESC;`, {
                type: db.sequelize.QueryTypes.SELECT,
            }).catch((e) => {
                console.error(e);
            });
            
            return data;
        } catch (error) {
            throw error;
        }
    },

    async getAll(type, states) {
        try {
            let statesQuery = '';

            if (states) {
                let statesId = await db.sequelize.query(`SELECT states.id FROM states WHERE states.name IN ('${states.join("', '")}')`, {
                    type: db.sequelize.QueryTypes.SELECT,
                }).catch(e => {
                    console.error(e);
                });

                const stringOfStatesIds = statesId.map(elem => { return elem.id; }).join(', ');

                statesQuery = `and leads.state_id in (${stringOfStatesIds})`;
            }

            let data = await db.sequelize.query(`SELECT leads.id, leads.empty, leads.fullname, CONCAT(users.fname, ' ', users.lname) as agent_fullname, users.email as agent_email, leads.email, leads.property, leads.busy, sources.title AS source_title, sources.name AS source, status.name AS status, status.title AS status_title, states.name AS state, prices.price, leads.updatedAt AS updated FROM leads LEFT JOIN users ON leads.user_id = users.id INNER JOIN sources ON leads.source_id = sources.id INNER JOIN status ON leads.status_id = status.id INNER JOIN states ON leads.state_id = states.id INNER JOIN prices ON leads.id = prices.lead_id WHERE leads.empty = 0 AND leads.type_id = (SELECT types.id FROM types WHERE types.name = '${type}') ${statesQuery} ORDER BY leads.id DESC;`, {
                type: db.sequelize.QueryTypes.SELECT,
            }).catch((e) => {
                console.error(e);
            });

            data = data.map(lead => {
                lead.property = JSON.parse(lead.property);
                lead.price = JSON.parse(lead.price);

                lead.updated = TransformationHelper.formatDate(lead.updated, true);

                lead = { ...lead, ...lead.property };

                return lead;
            });

            return data;
        } catch (error) {
            throw error;
        }
    },

    async getOne(id) {
        try {
            let lead = await db.sequelize.query("SELECT leads.id, leads.user_id, leads.state_id, leads.phone, leads.empty, leads.fullname, CONCAT(users.fname, ' ', users.lname) as agent_fullname, users.email as agent_email, leads.email, leads.property, leads.busy, status.name AS status, status.title AS status_title, states.name AS state, prices.price, leads.updatedAt AS updated, sources.title AS source_title, sources.name AS source FROM leads INNER JOIN sources ON sources.id = leads.source_id LEFT JOIN users ON leads.user_id = users.id LEFT JOIN status ON leads.status_id = status.id LEFT JOIN states ON leads.state_id = states.id LEFT JOIN prices ON leads.id = prices.lead_id WHERE leads.id = " + id, {
                type: db.sequelize.QueryTypes.SELECT,
                plain: true
            });

            lead.property = JSON.parse(lead.property);
            lead.price = JSON.parse(lead.price);
            lead = { ...lead, ...lead.property };
            lead.updated = TransformationHelper.formatDate(lead.updated, true);
            delete lead.property;

            return lead;
        } catch (error) {
            throw error;
        }
    },

    async getEmptyAll() {
        try {
            let data = await db.sequelize.query("SELECT leads.id, leads.createdAt, leads.empty, leads.phone, leads.fullname, CONCAT(users.fname, ' ', users.lname) as agent_fullname, leads.email, leads.property, leads.busy, types.name AS type, sources.title AS source_title, sources.name AS source, status.name AS status, status.title AS status_title, states.name AS state, prices.price, leads.updatedAt AS updated FROM leads LEFT JOIN users ON leads.user_id = users.id INNER JOIN sources ON leads.source_id = sources.id LEFT JOIN status ON leads.status_id = status.id LEFT JOIN states ON leads.state_id = states.id LEFT JOIN prices ON leads.id = prices.lead_id LEFT JOIN types ON leads.type_id = types.id WHERE leads.empty = 1 AND (leads.phone IS NOT NULL OR leads.email IS NOT NULL) ORDER BY leads.id DESC;", {
                type: db.sequelize.QueryTypes.SELECT
            });

            data = data.map(lead => {
                lead.property = JSON.parse(lead.property);
                lead.price = JSON.parse(lead.price);

                if (lead.property.birth_date) {
                    lead.property.birth_date = TransformationHelper.formatDate(lead.property.birth_date)
                }

                lead = { ...lead, ...lead.property };

                if ('property' in lead) {
                    delete lead.property;
                }

                lead.updated = TransformationHelper.formatDate(lead.updated, true);

                return lead;
            });

            return data;
        } catch (error) {
            throw error;
        }
    },

    async getRawLead(lead_id) {
        try {
            let lead = await db.sequelize.query("SELECT leads.id, leads.createdAt, leads.empty, leads.fullname, CONCAT(users.fname, ' ', users.lname) as agent_fullname, leads.email, leads.property, leads.busy, types.name AS type, sources.title AS source_title, sources.name AS source, status.name AS status, status.title AS status_title, states.name AS state, prices.price, leads.updatedAt AS updated FROM leads LEFT JOIN users ON leads.user_id = users.id INNER JOIN sources ON leads.source_id = sources.id INNER JOIN status ON leads.status_id = status.id LEFT JOIN states ON leads.state_id = states.id LEFT JOIN prices ON leads.id = prices.lead_id LEFT JOIN types ON leads.type_id = types.id WHERE leads.id = " + lead_id, {
                type: db.sequelize.QueryTypes.SELECT,
                plain: true
            });

            lead.property = JSON.parse(lead.property);
            lead.price = JSON.parse(lead.price);

            if ("birth_date" in lead.property) {
                lead.property.birth_date = TransformationHelper.formatDate(lead.property.birth_date, false);
            }

            lead.updated = TransformationHelper.formatDate(lead.updated, true);

            return lead;
        } catch (error) {
            throw error;
        }
    },

    async getByUserId(type, user_id) {
        try {
            let data = await db.sequelize.query("SELECT leads.id, leads.user_id, leads.phone, leads.empty, leads.fullname, CONCAT(users.fname, ' ', users.lname) as agent_fullname, users.email as agent_email, leads.email, leads.property, leads.busy, status.name AS status, status.title AS status_title, states.name AS state, prices.price, leads.updatedAt AS updated, sources.title AS source_title, sources.name AS source FROM leads INNER JOIN sources ON sources.id = leads.source_id LEFT JOIN users ON leads.user_id = users.id LEFT JOIN status ON leads.status_id = status.id LEFT JOIN states ON leads.state_id = states.id LEFT JOIN prices ON leads.id = prices.lead_id WHERE leads.user_id = '" + user_id + "' AND leads.type_id = (SELECT types.id FROM types WHERE types.name = '" + type.toLowerCase() + "') ORDER BY leads.id DESC;", {
                type: db.sequelize.QueryTypes.SELECT,
            })
            data = data.map(lead => {
                lead.property = JSON.parse(lead.property);

                if ("agent_fullname" in lead.property) {
                    delete lead.property.agent_fullname
                }

                if ("agent_email" in lead.property) {
                    delete lead.property.agent_email
                }

                lead.price = JSON.parse(lead.price);

                lead.updated = TransformationHelper.formatDate(lead.updated, true);

                lead = { ...lead, ...lead.property };

                return lead;
            });

            return data;
        } catch (error) {
            throw error;
        }
    },

    async getLeadsBySource(source) {
        try {
            let data = await db.sequelize.query(`SELECT leads.id, leads.empty, leads.fullname, users.fname, users.lname, users.email as agent_email, CONCAT(users.fname, ' ', users.lname) as agent_fullname, leads.email, leads.property, leads.busy, sources.title AS source_title, sources.name AS source, status.name AS status, status.title AS status_title, states.name AS state, prices.price, leads.updatedAt AS updated FROM leads LEFT JOIN users ON leads.user_id = users.id INNER JOIN sources ON leads.source_id = sources.id INNER JOIN status ON leads.status_id = status.id INNER JOIN states ON leads.state_id = states.id INNER JOIN prices ON leads.id = prices.lead_id WHERE leads.empty = 0 AND sources.name = "${source}" ORDER BY leads.id DESC;`, {
                type: db.sequelize.QueryTypes.SELECT,
            });

            data = data.map(lead => {
                lead.property = JSON.parse(lead.property);
                lead.price = JSON.parse(lead.price);

                lead.updated = TransformationHelper.formatDate(lead.updated, true);

                lead = { ...lead, ...lead.property };

                return lead;
            });

            return data;
        } catch (error) {
            throw error;
        }
    },

    async getAssignUserID(lead_id) {
        try {
            const data = await db.sequelize.query('SELECT leads.user_id FROM leads WHERE leads.id = ' + lead_id, {
                type: db.sequelize.QueryTypes.SELECT,
                plain: true
            });

            return data.user_id;
        } catch (error) {
            throw error;
        }
    },

    async getEmailSended(email_client) {
        try {
            const data = await db.sequelize.query(`SELECT leads.email_sended FROM leads WHERE leads.email = "${email_client}"`, {
                type: db.sequelize.QueryTypes.SELECT,
                plain: true
            });

            return data.email_sended;
        } catch (error) {
            throw error;
        }
    },
}

module.exports = LeadRepository;