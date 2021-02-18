const ImedTransService = {
  getImedUser(db, imedtrans_userid) {
    return db
      .from("med_users")
      .select("med_users.userid", "med_users.useremail")
      .where("med_users.useremail", imedtrans_userid)
      .first();
  },
  insertImedTransportUser(db, newUser) {
    return db
      .insert(newUser)
      .into("med_users")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },
  getAllLoggedTransports(db) {
    return db
      .from("transport_entry")
      .select(
        "transport_entry.transportid",
        "transport_entry.starting_location",
        "transport_entry.destination_location",
        "transport_entry.date_of_transport",
        "transport_entry.mileage",
        "transport_entry.requested_user"
      );
  },
  getTransportByUserId(db, requested_user_Id) {
    return db
      .from("transport_entry")
      .select(
        "transport_entry.transportid",
        "transport_entry.starting_location",
        "transport_entry.destination_location",
        "transport_entry.date_of_transport",
        "transport_entry.mileage",
        "transport_entry.requested_user"
      )
      .where("transport_entry.requested_userId", requested_user_Id)
      .first();
  },
  insertTransport(db, newTransport) {
    return db
      .insert(newTransport)
      .into("transport_entry")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },
  deleteTransportLog(db, transport_id) {
    return db("transport_entry").where({ transportid: transport_id }).delete();
  },
  updateTransportLog(db, transport_id, newTransport) {
    return db("transport_entry")
      .where({ transportid: transport_id })
      .update(newTransport, (returning = true))
      .returning("*");
  },
};

module.exports = ImedTransService;
