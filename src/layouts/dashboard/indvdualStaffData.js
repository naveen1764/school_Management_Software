import React, { useState, useEffect, Fragment } from "react";
import { Row, Col, Label, Modal, ModalHeader, ModalBody, Table } from "reactstrap";
import PropTypes from "prop-types";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Card } from "@mui/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "bootstrap/dist/css/bootstrap.min.css";

const IndividualStaffData = ({ selStaffData }) => {
  const currentDate = new Date();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(currentDate);
  const [filteredData, setFilteredData] = useState([]);
  const [sundaysCount, setSundaysCount] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [modalType, setModalType] = useState("");

  useEffect(() => {
    if (startDate && endDate) {
      const filtered = selStaffData.attObject.filter((entry) => {
        const entryDate = new Date(entry.date);
        return entryDate >= startDate && entryDate <= endDate;
      });

      // Count Sundays
      let sundays = 0;
      filtered.forEach((entry) => {
        const entryDate = new Date(entry.date);
        if (entryDate.getDay() === 0) {
          // 0 indicates Sunday
          sundays++;
        }
      });
      setSundaysCount(sundays);

      setFilteredData(filtered);
    } else {
      setFilteredData(selStaffData.attObject);
    }
  }, [startDate, endDate, selStaffData.attObject]);

  const attendanceData = filteredData.filter((entry) => Object.keys(entry).length !== 0);

  const totalDays = attendanceData.filter((entry) => {
    return new Date(entry.date).getDay() !== 0; // Exclude Sundays from totalDays count
  }).length;

  const presentDays = attendanceData.filter((entry) => {
    if (new Date(entry.date).getDay() === 0) {
      // Check if it's a Sunday
      return false; // Exclude Sundays from present count
    } else {
      return entry.in !== "-" && entry.out !== "-"; // Include if both in and out are present
    }
  }).length;

  const absentDays = attendanceData.filter((entry) => {
    if (new Date(entry.date).getDay() === 0) {
      // Check if it's a Sunday
      return false; // Exclude Sundays from absent count
    } else {
      return (!entry.in && !entry.out) || entry.in === "-" || entry.out === "-"; // Include if both in and out are absent or either in or out is "-"
    }
  }).length;

  const lateArrivals = attendanceData.filter((entry) => {
    return (
      entry.in &&
      entry.in > selStaffData.ShiftIn &&
      new Date(entry.date).getDay() !== 0 &&
      !(entry.in === "-" && entry.out === "-")
    ); // Exclude Sundays and entries where both in and out are hyphens
  }).length;

  const earlyGo = attendanceData.filter((entry) => {
    return (
      entry.out &&
      entry.out < selStaffData.ShiftOut &&
      new Date(entry.date).getDay() !== 0 &&
      !(entry.in === "-" && entry.out === "-")
    ); // Exclude Sundays and entries where both in and out are hyphens
  }).length;

  const pieData = [
    { name: "Present Days", value: presentDays },
    { name: "Absent Days", value: absentDays },
    { name: "Late Arrivals", value: lateArrivals },
    { name: "Early Go's", value: earlyGo },
  ];

  const COLORS = ["#0088FE", "#FF8042", "#FFBB28", "#00C49F", "#FFC0CB"]; // Adding one more color

  // Function to toggle modal and set modal data
  const toggleModalView = (data, type) => {
    let filteredData = [];
    switch (type) {
      case "present":
        filteredData = data.filter((entry) => {
          if (entry.in !== "-" && entry.out !== "-") {
            const inTime = new Date(entry.in).getTime();
            const shiftInTime = new Date(selStaffData.ShiftIn).getTime();
            const outTime = new Date(entry.out).getTime();
            const shiftOutTime = new Date(selStaffData.ShiftOut).getTime();

            let remarks = [];
            if (inTime > shiftInTime) {
              remarks.push("Late");
            }
            if (outTime < shiftOutTime) {
              remarks.push("Early Go");
            }

            entry.remark = remarks.join(", ");
            return true;
          }
          return false;
        });
        break;

      case "absent":
        filteredData = data.filter(
          (entry) => (!entry.in && !entry.out) || entry.in === "-" || entry.out === "-"
        );
        break;

      case "sundays":
        filteredData = data.filter((entry) => new Date(entry.date).getDay() === 0);
        break;

      case "late":
        filteredData = data.filter((entry) => {
          if (
            entry.in &&
            entry.in > selStaffData.ShiftIn &&
            new Date(entry.date).getDay() !== 0 &&
            !(entry.in === "-" && entry.out === "-")
          ) {
            const inTime = new Date(entry.in).getTime();
            const shiftInTime = new Date(selStaffData.ShiftIn).getTime();
            const lateMinutes = (inTime - shiftInTime) / (1000 * 60);
            entry.remark = `Late by ${lateMinutes} minutes`;
            return true;
          }
          return false;
        });
        break;

      case "early":
        filteredData = data.filter((entry) => {
          if (
            entry.out &&
            entry.out < selStaffData.ShiftOut &&
            new Date(entry.date).getDay() !== 0 &&
            !(entry.in === "-" && entry.out === "-")
          ) {
            const outTime = new Date(entry.out).getTime();
            const shiftOutTime = new Date(selStaffData.ShiftOut).getTime();
            const earlyGoMinutes = (shiftOutTime - outTime) / (1000 * 60);
            entry.remark = `Early Go by ${earlyGoMinutes} minutes`;
            return true;
          }
          return false;
        });
        break;

      default:
        filteredData = data;
        break;
    }

    setModalType(type);
    setModalData(filteredData);
    setModalOpen(!modalOpen);
  };

  // Function to extract late minutes from remark
  const extractLateMinutes = (remark) => {
    const regex = /Late by (\d+) minutes/;
    const match = remark.match(regex);
    return match ? parseInt(match[1], 10) : 0; // Extracts the number of minutes from "Late by XX minutes"
  };

  // Function to extract early minutes from remark
  const extractEarlyMinutes = (remark) => {
    const regex = /Early Go by (\d+) minutes/;
    const match = remark.match(regex);
    return match ? parseInt(match[1], 10) : 0; // Extracts the number of minutes from "Early Go by XX minutes"
  };

  return (
    <Fragment>
      <div className="d-flex align-items-center mb-3">
        <div className="me-3">
          <Label for="startDatePicker">
            <small style={{ fontSize: "0.8Rem" }}>Start Date : </small>
          </Label>
          <DatePicker
            id="startDatePicker"
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            selectsStart
            dateFormat="dd/MM/yyyy"
            startDate={startDate}
            endDate={endDate}
            placeholderText="Start Date"
            className="form-control"
          />
        </div>
        <div>
          <Label for="endDatePicker">
            <small style={{ fontSize: "0.8Rem" }}>End Date : </small>
          </Label>
          <DatePicker
            id="endDatePicker"
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            selectsEnd
            dateFormat="dd/MM/yyyy"
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            placeholderText="End Date"
            className="form-control"
          />
        </div>
      </div>
      <Row>
        <Col md={7} className="d-flex justify-content-center align-items-center">
          <PieChart width={400} height={400}>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </Col>
        <Col md={5} className="d-flex flex-column">
          <Row>
            <Col md={6} className="mb-2">
              <Card
                className="mb-3 justify-content-center"
                style={{
                  height: "100%",
                  borderRadius: "15px",
                  background: "linear-gradient(to right, #007bff, #6610f2)", // Primary gradient
                  color: "#fff",
                  fontSize: "1rem",
                }}
              >
                <small className="text-center" style={{ padding: "10px" }}>
                  Working Days
                </small>
              </Card>
            </Col>
            <Col md={5} className="mb-2">
              <Card
                className="mb-3 justify-content-center"
                style={{
                  height: "100%",
                  borderRadius: "15px",
                  background: "linear-gradient(to left, #007bff, #6610f2)", // Primary gradient
                  color: "#fff",
                }}
              >
                <div className="text-center" style={{ padding: "1px", fontSize: "2rem" }}>
                  {totalDays}
                </div>
              </Card>
            </Col>
            <Col md={6} className="mb-2">
              <Card
                className="mb-3 justify-content-center"
                style={{
                  height: "100%",
                  borderRadius: "15px",
                  background: "linear-gradient(to right, #28a745, #218838)", // Success gradient
                  color: "#fff",
                  fontSize: "1rem",
                }}
              >
                <small className="text-center" style={{ padding: "10px" }}>
                  Present Days
                </small>
              </Card>
            </Col>
            <Col md={5} className="mb-2">
              <Card
                className="mb-3 justify-content-center"
                style={{
                  height: "100%",
                  borderRadius: "15px",
                  background: "linear-gradient(to left, #28a745, #218838)", // Success gradient
                  color: "#fff",
                }}
              >
                <div
                  className="text-center"
                  style={{ padding: "1px", fontSize: "2rem", cursor: "pointer" }}
                  onClick={() => toggleModalView(attendanceData, "present")}
                >
                  {presentDays}
                </div>
              </Card>
            </Col>
            <Col md={6} className="mb-2">
              <Card
                className="mb-3 justify-content-center"
                style={{
                  height: "100%",
                  borderRadius: "15px",
                  background: "linear-gradient(to right, #dc3545, #c82333)", // Danger gradient
                  color: "#fff",
                  fontSize: "1rem",
                }}
              >
                <small className="text-center" style={{ padding: "10px" }}>
                  Absent / Leave Days
                </small>
              </Card>
            </Col>
            <Col md={5} className="mb-2">
              <Card
                className="mb-3 justify-content-center"
                style={{
                  height: "100%",
                  borderRadius: "15px",
                  background: "linear-gradient(to left, #dc3545, #c82333)", // Danger gradient
                  color: "#fff",
                }}
              >
                <div
                  className="text-center"
                  style={{ padding: "1px", fontSize: "2rem", cursor: "pointer" }}
                  onClick={() => toggleModalView(attendanceData, "absent")}
                >
                  {absentDays}
                </div>
              </Card>
            </Col>

            <Col md={6} className="mb-2">
              <Card
                className="mb-3 justify-content-center"
                style={{
                  height: "100%",
                  borderRadius: "15px",
                  background: "linear-gradient(to right, #17a2b8, #007bff)", // Info gradient
                  color: "#fff",
                  fontSize: "1rem",
                }}
              >
                <small className="text-center" style={{ padding: "10px" }}>
                  Sundays/Holidays
                </small>
              </Card>
            </Col>
            <Col md={5} className="mb-2">
              <Card
                className="mb-3 justify-content-center"
                style={{
                  height: "100%",
                  borderRadius: "15px",
                  background: "linear-gradient(to left, #17a2b8, #007bff)", // Info gradient
                  color: "#fff",
                }}
              >
                <div
                  className="text-center"
                  style={{ padding: "1px", fontSize: "2rem", cursor: "pointer" }}
                  onClick={() => toggleModalView(attendanceData, "sundays")}
                >
                  {sundaysCount}
                </div>
              </Card>
            </Col>
            <Col md={6} className="mb-2">
              <Card
                className="mb-3 justify-content-center"
                style={{
                  height: "100%",
                  borderRadius: "15px",
                  background: "linear-gradient(to right, #ffc107, #e0a800)", // Warning gradient
                  color: "#fff",
                  fontSize: "1rem",
                }}
              >
                <small className="text-center" style={{ padding: "10px" }}>
                  Late Arrivals
                </small>
              </Card>
            </Col>
            <Col md={5} className="mb-2">
              <Card
                className="mb-3 justify-content-center"
                style={{
                  height: "100%",
                  borderRadius: "15px",
                  background: "linear-gradient(to left, #ffc107, #e0a800)", // Warning gradient
                  color: "#fff",
                }}
              >
                <div
                  className="text-center"
                  style={{ padding: "1px", fontSize: "2rem", cursor: "pointer" }}
                  onClick={() => toggleModalView(attendanceData, "late")}
                >
                  {lateArrivals}
                </div>
              </Card>
            </Col>
            <Col md={6} className="mb-2">
              <Card
                className="mb-3 justify-content-center"
                style={{
                  height: "100%",
                  borderRadius: "15px",
                  background: "linear-gradient(to right, #6c757d, #5a6268)", // Secondary gradient
                  color: "#fff",
                  fontSize: "1rem",
                }}
              >
                <small className="text-center" style={{ padding: "10px" }}>
                  Early Gos
                </small>
              </Card>
            </Col>
            <Col md={5} className="mb-2">
              <Card
                className="mb-3 justify-content-center"
                style={{
                  height: "100%",
                  borderRadius: "15px",
                  background: "linear-gradient(to left, #6c757d, #5a6268)", // Secondary gradient
                  color: "#fff",
                }}
              >
                <div
                  className="text-center"
                  style={{ padding: "1px", fontSize: "2rem", cursor: "pointer" }}
                  onClick={() => toggleModalView(attendanceData, "early")}
                >
                  {earlyGo}
                </div>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      <Modal
        className="modal-dialog-centered modal-xl"
        isOpen={modalOpen}
        toggle={() => setModalOpen(!modalOpen)}
      >
        <ModalHeader toggle={() => setModalOpen(!modalOpen)}>
          Attendance Details - {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
        </ModalHeader>
        <ModalBody className="text-center h6">
          <Table bordered responsive hover striped className="align-items-center text-center">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Date</th>
                <th>Shift Timings</th>
                <th>IN Punch</th>
                <th>OUT Punch</th>
                <th>Remark</th>
              </tr>
            </thead>
            <tbody>
              {modalData.map((entry, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{entry.date}</td>
                  <td>{`${selStaffData.ShiftIn} - ${selStaffData.ShiftOut}`}</td>
                  <td>{entry.in}</td>
                  <td>{entry.out}</td>
                  <td>{entry.remark}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </ModalBody>
      </Modal>
    </Fragment>
  );
};

IndividualStaffData.propTypes = {
  selStaffData: PropTypes.object.isRequired,
};

export default IndividualStaffData;
