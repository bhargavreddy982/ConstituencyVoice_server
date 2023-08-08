
let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../server.js");

//assertion style
chai.should();
chai.use(chaiHttp);

describe("Tasks API", () => {
  // test the GET route

  describe("GET /lg/validuser", () => {
    it("it should get all the tasks", async () => {
        token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NDJhOTMxMTE5ZTIyZTY5NTI0MzNmMmQiLCJpYXQiOjE2ODIzNjEzNzgsImV4cCI6MTY4MjQ0Nzc3OH0.Imc8MKLj6osTdlJuIXAck8Ef8s6APqa0AghlTcwb-L8"
      const response = await chai
        .request(server)
        .get("/lg/validuser")
        .set("Authorization", `Bearer ${token}`);
      response.should.have.status(201);
        response.body.should.be.a("object");
        response.body.ValidUserOne.should.have.property("fname","Bhanu reddy");
    })
  });


  describe("POST /complaints/send", () => {
    it("should update send", async () => {
        let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NDJhOTMxMTE5ZTIyZTY5NTI0MzNmMmQiLCJpYXQiOjE2ODIzNjEzNzgsImV4cCI6MTY4MjQ0Nzc3OH0.Imc8MKLj6osTdlJuIXAck8Ef8s6APqa0AghlTcwb-L8"
        const complaint = {
            "complaintId": "123456789",
                 'title' : "I have a complaint",
                 'description' : "I have a complaint",
                 'user' : "642a931119e22e6952433f2d",
                 'admins'  : ["64294a158753e39c06c5dca9","64294a518753e39c06c5dcac"]
        }
      const res = await chai
        .request(server)
        .post(`/complaints/send`)
        .field("complaintId", complaint.complaintId)
        .field("title", complaint.title)
        .field("description", complaint.description)
        .field("user", complaint.user)
        .field("admins", complaint.admins)
        .set("Authorization", `Bearer ${token}`);

      
    res.should.have.status(201);
    res.body.should.be.a("object");
    res.body.should.have.property("status", 201);
    res.body.should.have.property("savedComplaint");
    res.body.savedComplaint.should.have.property(
      "complaintId",
      complaint.complaintId
    );
    res.body.savedComplaint.should.have.property("title", complaint.title);
    res.body.savedComplaint.should.have.property(
      "description",
      complaint.description
    );
    res.body.savedComplaint.should.have.property("user", complaint.user);
    res.body.savedComplaint.should.have.property("status", "sent");
    res.body.savedComplaint.should.have.property("admins");
    res.body.savedComplaint.admins.should.be.an("array");
    res.body.savedComplaint.admins.should.have.members(complaint.admins);
    res.body.savedComplaint.should.have.property("attachments");
    res.body.savedComplaint.attachments.should.be.an("array");
    res.body.savedComplaint.attachments.should.have.lengthOf(0);


    });
  });




});