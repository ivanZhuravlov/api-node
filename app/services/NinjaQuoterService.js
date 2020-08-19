const axios = require('axios');
const { map } = require('lodash');
const _ = require('lodash');

class NinjaQuoter {

    constructor(companiesList, customerInfo) {
        this.companies = companiesList;
        this.customerQuoteFilds = customerInfo;
    }

    /**
     * Return list filtered companies
     */
    fetchQuotes() {
        return new Promise((resolve, reject) => {
            this.fetchCompanyListFromNinjaQuoter()
                .then(companies => {
                    if (companies) {
                        resolve(companies);
                    } else {
                        reject();
                    }
                }).catch(e => reject(e));
        });
    }

    async getPrice() {
        const companies = await this.fetchQuotes();
        companies.forEach(comp => {
            if (comp.company_code in this.companies && this.companies[comp.company_code] == 0)
                this.companies[comp.company_code] = comp.premium_monthly
        });

        return [
            this.companies,
            { type: 'ninjaquoter' }
        ];
    }

    async getCompaniesInfo() {
        const companies = await this.fetchQuotes();

        let companiesFullData = companies.filter(comp => {
            return comp.company_code in this.companies;
        });

        const comp = _.uniqBy(companiesFullData, 'company_code');

        return { companies: comp, type: 'ninjaquoter' };
    }


    // async getFullCompaniesData() {
    //     try {
    //         const ninjaQuoterCompanies = await this.fetchCompanyListFromNinjaQuoter();

    //         console.log("NinjaQuoter -> getQuotes -> ninjaQuoterCompanies", ninjaQuoterCompanies)

    //         return new Promise((resolve, reject) => {
    //             if (ninjaQuoterCompanies) {
    //                 resolve(this.filterCompaniesData(ninjaQuoterCompanies));
    //             } else reject();
    //         })
    //     } catch (error) {
    //         throw error;
    //     }
    // }

    // filterCompaniesPrice(ninjaQuoterCompanies) {
    //     ninjaQuoterCompanies.forEach(comp => {
    //         if (comp.company_code in this.companies)
    //             this.companies[comp.company_code] = comp.premium_monthly
    //     });

    //     return [
    //         this.companies,
    //         { type: 'ninjaquoter' }
    //     ];
    // }

    /**
     * Fetch companies list from Ninja Quoter API 
     */
    fetchCompanyListFromNinjaQuoter() {
        return new Promise((resolve, reject) => {
            axios.get(`https://wq.ninjaquoter.com/api/quoter/quotes/?state=${this.customerQuoteFilds.state}&birthdate=${this.customerQuoteFilds.birthdate}&gender=${this.customerQuoteFilds.gender}&rate_class=${this.customerQuoteFilds.rate_class}&smoker=${this.customerQuoteFilds.smoker}&coverage=${this.customerQuoteFilds.coverage}&term=${this.customerQuoteFilds.term}`, {
                auth: {
                    username: process.env.NINJA_QUOTER_API_TOKEN || '',
                    password: ''
                }
            }).then(res => {
                return resolve(res.data.results);
            }).catch(e => {
                console.error(e);
                return reject();
            });
        });
    }
}

module.exports = NinjaQuoter;