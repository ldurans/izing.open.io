/**
 * Multiple static utility function
 */
class Util {
  /**
   * Check if query is an id
   * @param {string} query The query to checked
   * @return {boolean}
   */
  static isID(query: any) {
    return !Number.isNaN(query);
  }

  static matchAdminPath(query: any, extract: any) {
    const isMatched = /\/direct_v2\/threads\/(\d+)\/admin_user_ids\/(\d+)/.test(
      query
    );
    return extract
      ? query
        .match(/\/direct_v2\/threads\/(\d+)\/admin_user_ids\/(\d+)/)
        .slice(1)
      : isMatched;
  }

  /**
   * Match message path
   * @param {string} query URL path to match
   * @param {boolean} extract Whether it should return the extracted data from the query
   * @return {string[]|boolean}
   */
  static matchMessagePath(query: any, extract: any) {
    const isMatched = /\/direct_v2\/threads\/(\d+)\/items\/(\d+)/.test(query);
    return extract
      ? query.match(/\/direct_v2\/threads\/(\d+)\/items\/(\d+)/).slice(1)
      : isMatched;
  }

  static matchInboxThreadPath(query: any, extract: any) {
    const isMatched = /\/direct_v2\/inbox\/threads\/(\d+)/.test(query);
    return extract
      ? query.match(/\/direct_v2\/inbox\/threads\/(\d+)/).slice(1)
      : isMatched;
  }

  static isMessageValid(message: any) {
    return message.timestamp / 1000 + 10000 > Date.now();
  }
}

module.exports = Util;
