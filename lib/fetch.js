/*
 * @Auther: renjm
 * @Date: 2019-12-12 15:43:28
 * @LastEditTime: 2020-05-22 10:28:49
 * @Description:
 */

const rp = require("request-promise");

/**
 * create fetch
 *
 * @param options {Object}
 * @return Promise {Any}
 */
exports.fetch = (options) => rp(options);
