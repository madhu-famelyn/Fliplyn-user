import React from "react";
import "./policy.css";
import Header from "../Pages/Header/Header";

const PolicyReview = () => {
  return (
    <>
      <Header />

      <div className="policy-container">
        <h1 className="policy-title">Review your policy pages</h1>
        <p className="policy-subtitle">
          We’ve created these using your given details
        </p>

        {/* Terms & Conditions */}
        <div className="policy-section">
          <h2>Terms & Conditions</h2>
          <p>
            For the purpose of these Terms and Conditions, the term "we", "us",
            "our" used anywhere on this page shall mean NEOS GROUP, whose
            registered/operational office is 3rd floor, above Bata showroom,
            Madhapur, Hyderabad, Telangana 500081. "You", "your", "user",
            "visitor" shall mean any natural or legal person who is visiting our
            website and/or agreed to purchase from us.
          </p>

          <p>
            Your use of the website and/or purchase from us are governed by the
            following Terms and Conditions. The content of the pages of this
            website is subject to change without notice. Neither we nor any
            third parties provide any warranty or guarantee as to the accuracy,
            timeliness, performance, completeness or suitability of the
            information and materials found or offered on this website for any
            particular purpose.
          </p>

          <p>
            You acknowledge that such information and materials may contain
            inaccuracies or errors and we expressly exclude liability for any
            such inaccuracies or errors to the fullest extent permitted by law.
            Your use of any information or materials on our website and/or
            product pages is entirely at your own risk.
          </p>

          <p>
            It shall be your own responsibility to ensure that any products,
            services or information available through our website meet your
            specific requirements.
          </p>

          <p>
            Our website contains material which is owned by or licensed to us.
            This material includes, but is not limited to, the design, layout,
            look, appearance and graphics. Reproduction is prohibited other than
            in accordance with the copyright notice.
          </p>

          <p>
            Unauthorized use of information provided by us shall give rise to a
            claim for damages and/or be a criminal offense. Any dispute arising
            out of use of our website and/or purchase with us is subject to the
            laws of India.
          </p>

          <p>
            We shall be under no liability whatsoever in respect of any loss or
            damage arising directly or indirectly out of the decline of
            authorization for any transaction on account of the cardholder
            having exceeded the preset limit agreed with our acquiring bank.
          </p>
        </div>

        {/* Cancellation & Refund Policy */}
        <div className="policy-section">
          <h2>Cancellation & Refund Policy</h2>
          <p>
            NEOS GROUP believes in helping its customers as far as possible and
            has therefore a liberal cancellation policy.
          </p>

          <p>
            Cancellations will be considered only if the request is made within
            1-2 days of placing the order. Cancellation may not be entertained if
            the order has been communicated to vendors or shipping has begun.
          </p>

          <p>
            NEOS GROUP does not accept cancellation requests for perishable
            items like flowers or eatables. Refund or replacement can be made
            if the customer establishes that the product quality is not good.
          </p>

          <p>
            Damaged or defective items must be reported within 1-2 days of
            receipt. The merchant will verify the issue before refund or
            replacement.
          </p>

          <p>
            In case of complaints regarding products with manufacturer warranty,
            customers should contact the manufacturer directly.
          </p>

          <p>
            Any approved refund will take 1-2 days to process to the customer.
          </p>
        </div>

        {/* Privacy Policy */}
        <div className="policy-section">
          <h2>Privacy Policy</h2>
          <p>
            This privacy policy sets out how NEOS GROUP uses and protects any
            information that you give when you visit our website or purchase
            from us. NEOS GROUP is committed to ensuring that your privacy is
            protected.
          </p>

          <p>
            We may collect personal information such as name, contact details,
            demographic information, preferences, interests, and other data
            relevant to customer surveys or offers.
          </p>

          <p>
            We use this information for internal record keeping, improving
            products and services, sending promotional emails, market research,
            and customizing the website according to user interests.
          </p>

          <p>
            We are committed to ensuring that your information is secure and
            have implemented suitable measures to prevent unauthorized access.
          </p>

          <p>
            You may restrict the use of your personal information at any time by
            contacting us at team@neosbiryani.com.
          </p>
        </div>

        {/* Shipping & Delivery Policy */}
        <div className="policy-section">
          <h2>Shipping Policy</h2>
          <p>
            For international buyers, orders are shipped through registered
            international courier companies or International Speed Post. For
            domestic buyers, orders are shipped through registered domestic
            courier companies or Speed Post.
          </p>

          <p>
            Orders are shipped within 1-2 days or as per the delivery date agreed
            at the time of order confirmation. NEOS GROUP is not liable for any
            delay caused by courier or postal authorities.
          </p>

          <p>
            Delivery will be made to the address provided by the buyer. Delivery
            confirmation will be sent to the registered email ID.
          </p>

          <p>
            For any issues, please contact our helpdesk at 9100540053 or
            team@neosbiryani.com.
          </p>
        </div>

        {/* Contact Information */}
        <div className="policy-section">
          <h2>Contact Information</h2>
          <p>
            <strong>Merchant Legal Entity:</strong> NEOS GROUP <br />
            <strong>Registered Address:</strong> 3rd floor, above Bata showroom,
            Madhapur, Hyderabad, Telangana 500081 <br />
            <strong>Operational Address:</strong> 3rd floor, above Bata showroom,
            Madhapur, Hyderabad, Telangana 500081 <br />
            <strong>Telephone:</strong> 9100540053 <br />
            <strong>Email:</strong> team@neosbiryani.com
          </p>
        </div>
      </div>
    </>
  );
};

export default PolicyReview;
