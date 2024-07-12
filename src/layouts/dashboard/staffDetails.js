import axios from "axios";
import { Fragment, useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import PropTypes from "prop-types";
import { Button, Row, Table, Col, Input, Modal, ModalBody, ModalHeader, Badge } from "reactstrap";
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

const StaffDetails = ({ staffData }) => {
  const [filteredStaffData, setFilteredStaffData] = useState(staffData);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("All_School");
  const [selectedCampus, setSelectedCampus] = useState("All_Campuses");
  const [selectedDept, setSelectedDept] = useState("All_Dept");
  const [selectedDesig, setSelectedDesig] = useState("All_Desig");
  const [selectedSubject, setSelectedSubject] = useState("All_Subject");
  const [selectedGender, setSelectedGender] = useState("All_Genders");
  const [showSalary, setShowSalary] = useState(false);

  const printableTableRef = useRef();

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

  const handleShowSalary = () => {
    setShowSalary(!showSalary);
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

  return (
    <Fragment>
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
            style={{
              display: "inline",
              width: "auto",
              marginRight: "10px",
              fontSize: "15px",
            }}
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
          <Button size="sm" color="success" onClick={handleShowSalary}>
            <DollarSign size={18} /> {showSalary ? "Hide" : "Show"}
          </Button>
        </div>
      </div>
      <div ref={printableTableRef} id="tbl1">
        <Table bordered responsive hover striped className="align-items-center text-center">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Staff Name</th>
              <th>EMP Code</th>
              <th>Date of Join</th>
              <th>School</th>
              <th>Campus</th>
              <th>Dept</th>
              <th>Designation</th>
              <th>Subject</th>
              {showSalary ? <th>Salary</th> : ""}
              <th>Shift Timings</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaffData.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td
                  className={item.Gender === "Female" ? "text-danger" : ""}
                  style={{ textAlign: "left" }}
                >
                  {item.StaffName}
                </td>
                <td>{item.EmpCode}</td>
                <td>{item.DateofJoin}</td>
                <td>{item.SchoolName}</td>
                <td>{item.CampusName}</td>
                <td>{item.Dept}</td>
                <td>{item.Desig}</td>
                <td>{item.Subject}</td>
                {showSalary ? <td className="text-primary">{item.Salary}</td> : ""}
                <td>{`${item.ShiftIn} - ${item.ShiftOut}`}</td>
                <td>
                  <div
                    style={{ cursor: "pointer" }}
                    onClick={() => handleAttDtlsView(index + 1, item)}
                  >
                    <ArrowRightCircle size={18} className="text-danger" />
                  </div>
                </td>
              </tr>
            ))}
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

StaffDetails.propTypes = {
  staffData: PropTypes.array.isRequired,
};

export default StaffDetails;
