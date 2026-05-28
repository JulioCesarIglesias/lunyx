const DashboardPage = async () => {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  return <div>Dashboard</div>;
};

export default DashboardPage;