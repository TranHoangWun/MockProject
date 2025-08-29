// ...existing code...

// Modify the data fetching function to include user details
const fetchReports = async () => {
  try {
    const response = await axios.get('/api/reports');
    // Assuming the reports data needs to be enhanced with user information
    const reportsWithUserDetails = await Promise.all(
      response.data.map(async (report) => {
        // Fetch reporter details
        const reporterResponse = await axios.get(`/api/users/${report.reporterId}`);
        
        // Fetch reported person details
        const reportedResponse = await axios.get(`/api/users/${report.reportedId}`);
        
        return {
          ...report,
          reporterName: reporterResponse.data.name || 'Không xác định',
          reportedName: reportedResponse.data.name || 'Không xác định'
        };
      })
    );
    setReports(reportsWithUserDetails);
  } catch (error) {
    console.error('Error fetching reports:', error);
  }
};

// ...existing code...

// Update the table rendering to display actual user names
return (
  <div>
    {/* ...existing code... */}
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Nội dung</th>
          <th>Người báo cáo</th>
          <th>Người bị báo cáo</th>
          <th>Thời gian</th>
          <th>Trạng thái</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        {reports.map((report) => (
          <tr key={report.id}>
            <td>{report.id}</td>
            <td>{report.content}</td>
            <td>{report.reporterName}</td>
            <td>{report.reportedName}</td>
            <td>{report.timestamp || 'N/A'}</td>
            <td>{report.status}</td>
            <td>
              {/* Action buttons */}
              <button className="view-btn"><i className="fa fa-eye"></i></button>
              <button className="approve-btn"><i className="fa fa-check"></i></button>
              <button className="delete-btn"><i className="fa fa-trash"></i></button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    {/* ...existing code... */}
  </div>
);

// ...existing code...
