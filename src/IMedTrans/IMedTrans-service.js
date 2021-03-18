const ImedTransService = {
  hasUserWithUserName(db, user_name) {
    console.log("Trying the DB");
    return db("med_users")
      .where({ user_name })
      .first()
      .then((user) => !!user);
  },
  getImedUser(db, imedtrans_userid) {
    return db
      .from("med_users")
      .select("med_users.userid", "med_users.useremail")
      .where("med_users.userid", imedtrans_userid)
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
      .innerJoin(
        "med_users",
        "transport_entry.requested_user",
        "med_users.userid"
      )
      .select(
        "transport_entry.transportid",
        "transport_entry.starting_location",
        "transport_entry.destination_location",
        "transport_entry.date_of_transport",
        "transport_entry.mileage",
        "med_users.user_name"
      );
  },
  getTransportByUserId(db, requested_user_Id) {
    return db
      .from("transport_entry")
      .innerJoin(
        "med_users",
        "transport_entry.requested_user",
        "med_users.userid"
      )
      .select(
        "transport_entry.transportid",
        "transport_entry.starting_location",
        "transport_entry.destination_location",
        "transport_entry.date_of_transport",
        "transport_entry.mileage",
        "med_users.user_name"
      )
      .where("transport_entry.requested_user", requested_user_Id);
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
