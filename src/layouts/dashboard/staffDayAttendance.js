import axios from "axios";
import { Fragment, useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import PropTypes from "prop-types";
import {
  Button,
  Row,
  Table,
  Col,
  Input,
  Modal,
  ModalBody,
  ModalHeader,
  Badge,
  Card,
  CardBody,
} from "reactstrap";
import "styles.css";
import {
  HideImage,
  Money,
  MoneyOff,
  Print,
  ShowChart,
  Shower,
  Slideshow,
} from "@mui/icons-material";
import { useReactToPrint } from "react-to-print";
import { ArrowRightCircle, DollarSign, Eye } from "react-feather";
import IndividualStaffData from "./indvdualStaffData";
import * as XLSX from "xlsx";

const StaffDailyAttendance = ({ staffData }) => {
  const [filteredStaffData, setFilteredStaffData] = useState(staffData);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("All_School");
  const [selectedCampus, setSelectedCampus] = useState("All_Campuses");
  const [selectedDept, setSelectedDept] = useState("All_Dept");
  const [selectedDesig, setSelectedDesig] = useState("All_Desig");
  const [selectedSubject, setSelectedSubject] = useState("All_Subject");
  const [selectedGender, setSelectedGender] = useState("All_Genders");

  const printableTableRef = useRef();

  const today = new Date();
  const todayDate = `${String(today.getDate()).padStart(2, "0")}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${today.getFullYear()}`; // DD-MM-YYYY format

  useEffect(() => {
    let filteredData = staffData;

    if (selectedSchool !== "All_School") {
      filteredData = filteredData.filter((item) => item.SchoolName === selectedSchool);
    }
    if (selectedCampus !== "All_Campuses") {
      filteredData = filteredData.filter((item) => item.CampusName === selectedCampus);
    }
    if (selectedDept !== "All_Dept") {
      filteredData = filteredData.filter((item) => item.Dept === selectedDept);
    }
    if (selectedDesig !== "All_Desig") {
      filteredData = filteredData.filter((item) => item.Desig === selectedDesig);
    }
    if (selectedSubject !== "All_Subject") {
      filteredData = filteredData.filter((item) => item.Subject === selectedSubject);
    }
    if (selectedGender !== "All_Genders") {
      filteredData = filteredData.filter((item) => item.Gender === selectedGender);
    }
    if (searchTerm) {
      filteredData = filteredData.filter((item) => {
        return (
          item.StaffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.EmpCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.DateofJoin.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.SchoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.CampusName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.Dept.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.Desig.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.Subject.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    setFilteredStaffData(filteredData);
  }, [
    selectedSchool,
    selectedCampus,
    selectedDept,
    selectedDesig,
    selectedSubject,
    staffData,
    selectedGender,
    searchTerm,
  ]);

  const handlePrint = useReactToPrint({
    content: () => printableTableRef.current,
  });

  const uniqueValues = (data, key) => {
    return [...new Set(data.map((item) => item[key]))];
  };

  const [attDtlsModal, setAttDtlsModal] = useState(false);
  const [detailsData, setDetailsData] = useState("");
  const [dtlsId, setDtlsId] = useState();

  const handleAttDtlsView = (id, item) => {
    if (attDtlsModal !== id) {
      setAttDtlsModal(id);
      setDetailsData(item);
      setDtlsId(id);
    } else {
      setAttDtlsModal(null);
    }
  };

  const exportToExcel = () => {
    const table = document.getElementById("tbl1");
    const ws = XLSX.utils.table_to_sheet(table);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, "Staff_Details.xlsx");
  };

  const calculateTimeDifference = (shiftTime, actualTime) => {
    if (!shiftTime || !actualTime || shiftTime === "-" || actualTime === "-") {
      return null;
    }

    const [shiftHours, shiftMinutes] = shiftTime.split(":").map(Number);
    const [actualHours, actualMinutes] = actualTime.split(":").map(Number);

    const shiftDate = new Date(0, 0, 0, shiftHours, shiftMinutes, 0);
    const actualDate = new Date(0, 0, 0, actualHours, actualMinutes, 0);

    return (actualDate - shiftDate) / (1000 * 60); // Difference in minutes
  };

  const calculateRemarks = (shiftIn, shiftOut, inTime, outTime, remark) => {
    if (inTime === "-") {
      return remark && remark !== "-" ? `Leave - ${remark}` : "-";
    }

    const inDifference = calculateTimeDifference(shiftIn, inTime);
    const outDifference = calculateTimeDifference(outTime, shiftOut);

    let lateRemark = "";
    if (inDifference > 0) {
      lateRemark = `Late : ${inDifference} min`;
    }

    let earlyRemark = "";
    if (outDifference < 0) {
      earlyRemark = `Early Go : ${Math.abs(outDifference)} min`;
    }

    if (lateRemark && earlyRemark) {
      return `Present (${lateRemark}, ${earlyRemark})`;
    } else if (lateRemark) {
      return `Present (${lateRemark})`;
    } else if (earlyRemark) {
      return `Present (${earlyRemark})`;
    } else {
      return "Present";
    }
  };

  return (
    <Fragment>
      <Row className="mb-3 text-center align-items-center justify-content-center">
        <Col md={1}>
          <Card className="bg-primary text-white">
            <CardBody>Total Staff</CardBody>
          </Card>
        </Col>
        <Col md={1}>
          <Card className="bg-success text-white">
            <CardBody>Present</CardBody>
          </Card>
        </Col>
        <Col md={1}>
          <Card className="bg-danger text-white">
            <CardBody>Absent</CardBody>
          </Card>
        </Col>
        <Col md={1}>
          <Card className="bg-warning">
            <CardBody>Late Arrivals</CardBody>
          </Card>
        </Col>
        <Col md={1}>
          <Card className="bg-secondary text-white">
            <CardBody>Early Go</CardBody>
          </Card>
        </Col>
      </Row>
      <div className="d-flex justify-content-between mb-2">
        <div>
          <div>
            <Button
              color="primary"
              size="sm"
              style={{ marginRight: "5px", borderRadius: "5px" }}
              onClick={exportToExcel}
            >
              <span className="text-white">Excel Export</span>
            </Button>
            <Button
              color="danger"
              size="sm"
              style={{ marginRight: "5px", borderRadius: "5px" }}
              onClick={handlePrint}
            >
              <Print />
            </Button>
          </div>
        </div>
        <div className="d-flex mb-1 justify-content-right">
          <Input
            style={{ display: "inline", width: "auto", marginRight: "10px", fontSize: "15px" }}
            type="text"
            placeholder="Search........"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Input
            style={{ display: "inline", width: "auto", marginRight: "10px", fontSize: "15px" }}
            type="select"
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
          >
            <option value="All_School">All Schools</option>
            {uniqueValues(staffData, "SchoolName").map((school) => (
              <option key={school} value={school}>
                {school}
              </option>
            ))}
          </Input>

          <Input
            style={{ display: "inline", width: "auto", marginRight: "10px", fontSize: "15px" }}
            type="select"
            value={selectedCampus}
            onChange={(e) => setSelectedCampus(e.target.value)}
          >
            <option value="All_Campuses">All Campuses</option>
            {uniqueValues(staffData, "CampusName").map((campus) => (
              <option key={campus} value={campus}>
                {campus}
              </option>
            ))}
          </Input>

          <Input
            style={{ display: "inline", width: "auto", marginRight: "10px", fontSize: "15px" }}
            type="select"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            <option value="All_Dept">All Departments</option>
            {uniqueValues(staffData, "Dept").map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </Input>

          <Input
            style={{ display: "inline", width: "auto", marginRight: "10px", fontSize: "15px" }}
            type="select"
            value={selectedDesig}
            onChange={(e) => setSelectedDesig(e.target.value)}
          >
            <option value="All_Desig">All Designations</option>
            {uniqueValues(staffData, "Desig").map((desig) => (
              <option key={desig} value={desig}>
                {desig}
              </option>
            ))}
          </Input>

          <Input
            style={{ display: "inline", width: "auto", marginRight: "10px", fontSize: "15px" }}
            type="select"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="All_Subject">All Subjects</option>
            {uniqueValues(staffData, "Subject").map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </Input>

          <Input
            style={{ display: "inline", width: "auto", marginRight: "10px", fontSize: "15px" }}
            type="select"
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
          >
            <option value="All_Genders">All Genders</option>
            {uniqueValues(staffData, "Gender").map((gender) => (
              <option key={gender} value={gender}>
                {gender}
              </option>
            ))}
          </Input>
        </div>
      </div>
      <div ref={printableTableRef} id="tbl1">
        <Table bordered responsive hover striped className="align-items-center text-center">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Staff Name</th>
              <th>EMP Code</th>
              {/* Uncomment the lines below if needed */}
              {/* <th>Date of Join</th> */}
              {/* <th>School</th> */}
              <th>Campus</th>
              <th>Dept</th>
              <th>Designation</th>
              <th>Subject</th>
              <th>Timings</th>
              <th className="table-primary">IN Time</th>
              <th className="table-primary">OUT Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaffData.map((item, index) => {
              const lastAttendance = item.attObject[item.attObject.length - 1];
              const inTime = lastAttendance?.in ?? "-";
              const outTime = lastAttendance?.out ?? "-";
              const remark = calculateRemarks(
                item.ShiftIn,
                item.ShiftOut,
                inTime,
                outTime,
                lastAttendance?.remark ?? "-"
              );

              return (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td
                    className={item.Gender === "Female" ? "text-danger" : ""}
                    style={{ textAlign: "left" }}
                  >
                    {item.StaffName}
                  </td>
                  <td>{item.EmpCode}</td>
                  {/* Uncomment the lines below if needed */}
                  {/* <td>{item.DateofJoin}</td> */}
                  {/* <td>{item.SchoolName}</td> */}
                  <td>{item.CampusName}</td>
                  <td>{item.Dept}</td>
                  <td>{item.Desig}</td>
                  <td>{item.Subject}</td>
                  <td>{`${item.ShiftIn} - ${item.ShiftOut}`}</td>
                  <td className="table-primary">{inTime}</td>
                  <td className="table-primary">{outTime}</td>
                  <td className={remark === "Present" ? "text-success" : "text-danger"}>
                    {remark}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>

      {dtlsId && (
        <Modal
          isOpen={attDtlsModal === dtlsId}
          toggle={() => handleAttDtlsView(dtlsId)}
          className="modal-dialog-centered modal-xl"
          key={dtlsId}
        >
          <ModalHeader toggle={() => handleAttDtlsView(dtlsId)}>
            <b className="text-primary">{detailsData.StaffName}</b> Report
          </ModalHeader>
          <ModalBody>
            <IndividualStaffData selStaffData={detailsData} />
          </ModalBody>
        </Modal>
      )}
    </Fragment>
  );
};

StaffDailyAttendance.propTypes = {
  staffData: PropTypes.array.isRequired,
};

export default StaffDailyAttendance;
