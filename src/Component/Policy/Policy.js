import React from "react";
import "./policy.css";

import Header from "../Pages/Header/Header";
const PolicyReview = () => {
  return (
    <><Header/>
    <div className="policy-container">
      <h1 className="policy-title">Review your policy pages</h1>
      <p className="policy-subtitle">
        We’ve created these using your given details
      </p>

      <div className="policy-section">
        <h2>Shipping & Delivery Policy</h2>
        <p>
          For International buyers, orders are shipped and delivered through
          registered international courier companies and/or International speed
          post only. For domestic buyers, orders are shipped through registered
          domestic courier companies and/or speed post only. Orders are shipped
          within 1-2 days or as per the delivery date agreed at the time of
          order confirmation and delivering of the shipment subject to Courier
          Company / post office norms. NEOS GROUP is not liable for any delay in
          delivery by the courier company / postal authorities and only
          guarantees to hand over the consignment to the courier company or
          postal authorities within 1-2 days from the date of the order and
          payment or as per the delivery date agreed at the time of order
          confirmation. Delivery of all orders will be to the address provided
          by the buyer. Delivery of our services will be confirmed on your mail
          ID as specified during registration. For any issues in utilizing our
          services you may contact our helpdesk on 9100540053 or
          team@neosbiryani.com
        </p>
      </div>

      <div className="policy-section">
        <h2>Contact Information</h2>
        <p>
          You may contact us using the information below: <br />
          <strong>Merchant Legal Entity:</strong> NEOS GROUP <br />
          <strong>Registered Address:</strong> 3rd floor, above Bata showroom,
          Madhapur, Hyderabad, Telangana 500081 <br />
          <strong>Operational Address:</strong> 3rd floor, above Bata showroom,
          Madhapur, Hyderabad, Telangana 500081 <br />
          <strong>Telephone:</strong> 9100540053 <br />
          <strong>Email:</strong> team@neosbiryani.com
        </p>
      </div>

      <div className="policy-section">
        <h2>Terms & Conditions</h2>
        <p>
          For the purpose of these Terms and Conditions, The term "we", "us",
          "our" used anywhere on this page shall mean NEOS GROUP, whose
          registered/operational office is 3rd floor, above Bata showroom
          Madhapur, Hyderabad Telangana 500081. "you", "your", "user",
          "visitor" shall mean any natural or legal person who is visiting our
          website and/or agreed to purchase from us.
        </p>
        <p>
          Your use of the website and/or purchase from us are governed by the
          following Terms and Conditions: The content of the pages of this
          website is subject to change without notice. Neither we nor any third
          parties provide any warranty or guarantee as to the accuracy,
          timeliness, performance, completeness or suitability of the
          information and materials found or offered on this website for any
          particular purpose.
        </p>
        <p>
          You acknowledge that such information and materials may contain
          inaccuracies or errors and we expressly exclude liability for any such
          inaccuracies or errors to the fullest extent permitted by law. Your
          use of any information or materials on our website and/or product
          pages is entirely at your own risk.
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
          damage arising from the decline of authorization for any transaction,
          on account of the cardholder having exceeded the preset limit agreed 
          by our acquiring bank.
        </p>
      </div>

      <div className="policy-section">
        <h2>Cancellation & Refund Policy</h2>
        <p>
          NEOS GROUP believes in helping its customers as far as possible, and
          has therefore a liberal cancellation policy.
        </p>
        <p>
          Cancellations will be considered only if the request is made within
          1-2 days of placing the order. Cancellation may not be entertained if
          the order has been communicated to the vendors or shipping has begun.
        </p>
        <p>
          NEOS GROUP does not accept cancellation requests for perishable items
          like flowers, eatables etc. Refund/replacement can be made if the
          customer establishes that the product quality is not good.
        </p>
        <p>
          Damaged/defective items must be reported within 1-2 days of receipt.
          The merchant must verify and approve the issue before refunding or
          replacing.
        </p>
        <p>
          Complaints about products with manufacturer warranty should be taken
          up directly with the manufacturer.
        </p>
        <p>
          Any approved refund will take 1-2 days to process to the customer.
        </p>
      </div>
    </div>
    </>
  );
};

export default PolicyReview;
