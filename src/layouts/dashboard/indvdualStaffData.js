import React, { useState, useEffect, Fragment } from "react";
import { Row, Col, Label, Modal, ModalHeader, ModalBody, Table } from "reactstrap";
import PropTypes from "prop-types";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Card } from "@mui/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "bootstrap/dist/css/bootstrap.min.css";

const COLORS = ["#0088FE", "#FF8042", "#FFBB28", "#00C49F", "#FFC0CB"];
const cardStyles = {
  primaryGradient: "linear-gradient(to right, #007bff, #6610f2)",
  successGradient: "linear-gradient(to right, #28a745, #218838)",
  dangerGradient: "linear-gradient(to right, #dc3545, #c82333)",
  infoGradient: "linear-gradient(to right, #17a2b8, #007bff)",
  warningGradient: "linear-gradient(to right, #ffc107, #e0a800)",
  secondaryGradient: "linear-gradient(to right, #6c757d, #5a6268)",
};

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

      const sundays = filtered.filter((entry) => new Date(entry.date).getDay() === 0).length;
      setSundaysCount(sundays);
      setFilteredData(filtered);
    } else {
      setFilteredData(selStaffData.attObject);
    }
  }, [startDate, endDate, selStaffData.attObject]);

  const attendanceData = filteredData.filter((entry) => Object.keys(entry).length !== 0);
  console.log(attendanceData, "Attendance Data");
  const totalDays = attendanceData.filter((entry) => new Date(entry.date).getDay() !== 0).length;
  const presentDays = attendanceData.filter(
    (entry) => entry.in !== "-" && entry.out !== "-"
  ).length;
  const absentDays = attendanceData.filter((entry) => {
    const entryDate = new Date(entry.date);
    return (
      entryDate.getDay() !== 0 && (!entry.in || !entry.out || entry.in === "-" || entry.out === "-")
    );
  }).length;
  const lateArrivals = attendanceData.filter((entry) => {
    const entryDate = new Date(entry.date);
    return entryDate.getDay() !== 0 && entry.in > selStaffData.ShiftIn;
  }).length;
  const earlyGo = attendanceData.filter((entry) => {
    const entryDate = new Date(entry.date);
    return entryDate.getDay() !== 0 && entry.out !== "-" && entry.out < selStaffData.ShiftOut;
  }).length;

  const pieData = [
    { name: "Present Days", value: presentDays },
    { name: "Absent Days", value: absentDays },
    { name: "Late Arrivals", value: lateArrivals },
    { name: "Early Go's", value: earlyGo },
  ];

  const toggleModalView = (type) => {
    const filteredData = filterModalData(type);
    setModalType(type);
    setModalData(filteredData);
    setModalOpen(!modalOpen);
  };

  const timeDiffFormat = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs} Hr ${mins} Min` : `${mins} Min`;
  };

  const filterModalData = (type) => {
    switch (type) {
      case "present":
        return attendanceData.filter((entry) => {
          if (entry.in === "-" || entry.out === "-") {
            return false; // Exclude entries with "-" in in or out
          }
          const entryDate = new Date(entry.date);
          if (entryDate.getDay() === 0) {
            // Check if the day is Sunday
            entry.remark = "";
            return true;
          }
          const remarks = [];
          const inTime = new Date(`${entry.date} ${entry.in}`);
          const shiftInTime = new Date(`${entry.date} ${selStaffData.ShiftIn}`);
          if (inTime > shiftInTime) {
            remarks.push(
              `Late Come by ${timeDiffFormat(
                (inTime.getTime() - shiftInTime.getTime()) / (1000 * 60)
              )}`
            );
          }
          const outTime = new Date(`${entry.date} ${entry.out}`);
          const shiftOutTime = new Date(`${entry.date} ${selStaffData.ShiftOut}`);
          if (outTime < shiftOutTime) {
            remarks.push(
              `Early Go by ${timeDiffFormat(
                (shiftOutTime.getTime() - outTime.getTime()) / (1000 * 60)
              )}`
            );
          }
          entry.remark = remarks.join(", ");
          return true;
        });
      case "absent":
        return attendanceData.filter((entry) => {
          const entryDate = new Date(entry.date);
          if (entryDate.getDay() === 0) return false; // Exclude Sundays

          if (!entry.in || !entry.out || entry.in === "-" || entry.out === "-") {
            // Entry is absent, now check for remarks in selStaffData
            const selDateData = selStaffData.attObject.find((data) => data.date === entry.date);
            if (selDateData && selDateData.remark) {
              entry.remark = selDateData.remark;
            } else {
              entry.remark = "";
            }
            return true;
          }
          return false;
        });
      case "sundays":
        return attendanceData.filter((entry) => new Date(entry.date).getDay() === 0);
      case "late":
        return attendanceData
          .filter((entry) => {
            const entryDate = new Date(entry.date);
            return (
              entryDate.getDay() !== 0 &&
              entry.in &&
              entry.in !== "-" &&
              new Date(`${entry.date} ${entry.in}`) >
                new Date(`${entry.date} ${selStaffData.ShiftIn}`)
            ); // Exclude Sundays
          })
          .map((entry) => {
            const inTime = new Date(`${entry.date} ${entry.in}`);
            const shiftInTime = new Date(`${entry.date} ${selStaffData.ShiftIn}`);
            const lateMinutes = (inTime.getTime() - shiftInTime.getTime()) / (1000 * 60);
            entry.remark = `Late by ${timeDiffFormat(lateMinutes.toFixed(2))}`;
            return entry;
          });
      case "early":
        return attendanceData
          .filter((entry) => {
            const entryDate = new Date(entry.date);
            if (entryDate.getDay() === 0) return false; // Exclude Sundays
            return (
              entry.out &&
              entry.out !== "-" &&
              new Date(`${entry.date} ${entry.out}`) <
                new Date(`${entry.date} ${selStaffData.ShiftOut}`)
            );
          })
          .map((entry) => {
            const outTime = new Date(`${entry.date} ${entry.out}`);
            const shiftOutTime = new Date(`${entry.date} ${selStaffData.ShiftOut}`);
            const earlyGoMinutes = (shiftOutTime.getTime() - outTime.getTime()) / (1000 * 60);
            entry.remark = `Early Go by ${timeDiffFormat(earlyGoMinutes.toFixed(2))}`;
            return entry;
          });
      default:
        return attendanceData;
    }
  };

  return (
    <Fragment>
      <div className="d-flex align-items-center mb-2">
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
        <Col md={6} className="d-flex justify-content-center align-items-center">
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
            {renderCard("Working Days", totalDays, cardStyles.primaryGradient)}
            {renderCard("Present Days", presentDays, cardStyles.successGradient, () =>
              toggleModalView("present")
            )}
            {renderCard("Absent / Leave", absentDays, cardStyles.dangerGradient, () =>
              toggleModalView("absent")
            )}
            {renderCard("Sundays/Holidays", sundaysCount, cardStyles.infoGradient, () =>
              toggleModalView("sundays")
            )}
            {renderCard("Late Arrivals", lateArrivals, cardStyles.warningGradient, () =>
              toggleModalView("late")
            )}
            {renderCard("Early Gos", earlyGo, cardStyles.secondaryGradient, () =>
              toggleModalView("early")
            )}
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
          {modalData.length > 0 ? (
            <Table bordered responsive hover striped className="align-items-center text-center">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Date</th>
                  <th>Day</th>
                  <th>Shift Timings</th>
                  <th>IN Punch</th>
                  <th>OUT Punch</th>
                  <th>Remark</th>
                </tr>
              </thead>
              <tbody>
                {modalData.map((entry, index) => {
                  const entryDate = new Date(entry.date);
                  const dayOfWeek = entryDate.toLocaleDateString("en-US", { weekday: "long" });

                  return (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td
                        style={{
                          background:
                            entryDate.getDay() === 0
                              ? "linear-gradient(to right, #ffcccb, #ffb6c1)"
                              : "none",
                        }}
                      >
                        {entry.date}
                      </td>
                      <td>
                        <i>{dayOfWeek}</i>
                      </td>
                      <td className="text-primary">{`${selStaffData.ShiftIn} - ${selStaffData.ShiftOut}`}</td>
                      <td>{entry.in}</td>
                      <td>{entry.out}</td>
                      <td
                        style={{
                          background:
                            entryDate.getDay() === 0
                              ? "linear-gradient(to right, #ffcccb, #ffb6c1)"
                              : "none",
                        }}
                        className="text-danger"
                      >
                        {entry.remark}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          ) : (
            <div className="text-center"> There are no records found.</div>
          )}
        </ModalBody>
      </Modal>
    </Fragment>
  );
};

const renderCard = (title, count, gradient, onClick) => (
  <Col xs={6} className="mb-2">
    <Card
      className="p-3 h-100 text-white"
      style={{
        cursor: "pointer",
        background: gradient,
      }}
      onClick={onClick}
    >
      <h6 className="text-center">{title}</h6>
      <div className="d-flex justify-content-center">
        <h1>{count}</h1>
      </div>
    </Card>
  </Col>
);

IndividualStaffData.propTypes = {
  selStaffData: PropTypes.shape({
    ShiftIn: PropTypes.string.isRequired,
    ShiftOut: PropTypes.string.isRequired,
    attObject: PropTypes.arrayOf(
      PropTypes.shape({
        date: PropTypes.string.isRequired,
        in: PropTypes.string.isRequired,
        out: PropTypes.string.isRequired,
        remark: PropTypes.string.isRequired,
      })
    ).isRequired,
  }).isRequired,
};

export default IndividualStaffData;
