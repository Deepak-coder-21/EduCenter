function Privacy() {
  return (
    <main className="bg-white py-16">
      <div className="container mx-auto px-6 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">Privacy Policy</h1>
        <p className="text-center text-gray-500 mb-12">Last Updated: June 13, 2025</p>

        <section className="prose max-w-none">
          <h2>1. Information We Collect</h2>
          <p>We may collect information about you in a variety of ways. The information we may collect on the site includes:</p>

          <h3>Personal Data</h3>
          <p>
            Personally identifiable information, such as your name, email address, and telephone number, and demographic
            information, such as your age, gender, hometown, and interests, that you voluntarily give to us when you register.
          </p>

          <h3>Usage Data</h3>
          <p>
            Information our servers automatically collect when you access the site, such as your IP address, browser type,
            operating system, access times, and pages visited.
          </p>

          <h2>2. Use of Your Information</h2>
          <p>We use the information we collect in the following ways:</p>
          <ul>
            <li>To improve our services and user experience</li>
            <li>To send administrative information such as confirmations and updates</li>
            <li>To protect against fraudulent activity</li>
          </ul>

          <h2>3. Contact Us</h2>
          <p>If you have questions or comments about this Privacy Policy, please contact us at support@educenter.com.</p>
        </section>
      </div>
    </main>
  );
}

export default Privacy;