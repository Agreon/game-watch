/* eslint-disable max-len */
import { Box, Flex, Text } from '@chakra-ui/react';
import { NextPage } from 'next';

const PrivacyPolicy: NextPage = () => {
    return (
        <Box>
            <Text fontSize="2xl" textAlign="center" mb="2rem">Our Privacy Policy</Text>
            <Text mb="1rem"><em>Last updated: Oct 15, 2022</em></Text>
            <p>
                This privacy policy will explain how we use the personal data we
                collect from you when you use our website.
                We promise we never sell your data: never have, never will.
            </p>
            <p>Topics:</p>
            <ul>
                <li>What data do we collect?</li>
                <li>How do we collect your data?</li>
                <li>How will we use your data?</li>
                <li>How do we store your data?</li>
                <li>What are your data protection rights?</li>
                <li>What are cookies?</li>
                <li>How do we use cookies?</li>
                <li>What types of cookies do we use?</li>
                <li>How to manage your cookies</li>
                <li>Privacy policies of other websites</li>
                <li>Transmission to third countries</li>
                <li>Changes to our privacy policy</li>
                <li>How to contact us</li>
                <li>How to contact the appropriate authorities</li>
            </ul>
            <Text fontSize="2xl">What data do we collect?</Text>
            <span>
                Our guiding principle is to collect only what we need.
                We collect the following data from you:
            </span>
            <ul>
                <li>Identity &amp; access</li>
                <li>Product Interactions</li>
                <li>Website Interactions</li>
                <li>Geolocation Data</li>
                <li>Voluntary correspondence</li>
            </ul>

            <Text fontSize="2xl">How do we collect your data?</Text>
            <Text>
                You directly provide us with most of the data we collect.
                We collect data and process data when you:
            </Text>
            <ul>
                <li>Use or view our website via your browser’s cookies.</li>
                <li>You send us an email.</li>
            </ul>

            <Text fontSize="2xl">How will we use your data?</Text>

            <Text fontSize="xl" id="identity--access">Identity &amp; access</Text>
            <Text mb="1rem">
                When you sign up for GameWatch, we ask for identifying information such as your
                email address. With your consent, this email is only used to send you notifications
                about game updates. You can always opt out of this in the settings.
            </Text>

            <Text fontSize="xl" id="product-interactions">Product interactions</Text>
            <Text mb="1rem">
                We store on our servers the content that you upload or receive or maintain in
                your account. This is so you can use our products as intended,
                We keep this content as long as your account is active. If you delete your account,
                we’ll delete the content within 60 days.
            </Text>

            <Text fontSize="xl" id="website-interactions">Website interactions</Text>
            <Text mb="1rem">
                We collect information about your browsing activity for analytics and statistical
                purposes such as conversion rate testing and experimenting with new product
                designs. This includes, for example, your browser and operating system versions,
                your IP address, which web pages you visited and how long they took to load,
                and which website referred you to us.
            </Text>

            <Text fontSize="xl" id="geolocation-data">Geolocation data</Text>
            <Text mb="1rem">
                We use your IP address to be able to suggest you a country of origin when you first
                visit the site. The IP address is not stored on our servers.
            </Text>

            <Text fontSize="xl" id="voluntary-correspondence">Voluntary correspondence</Text>
            <Text mb="1rem">
                When you email us with a question or to ask for help, we keep that
                correspondence, including your email address, so that we have a history of
                past correspondence to reference if you reach out in the future.
            </Text>

            <Text fontSize="2xl">How do we store your data?</Text>
            <Text mb="1rem">We securely store your data at a <a href="https://www.hetzner.com/unternehmen/rechenzentrum/">Hetzner data center</a> in Germany.</Text>

            <Text mb="1rem">
                All data is encrypted via <a href="https://en.wikipedia.org/wiki/Transport_Layer_Security">SSL/TLS</a> when
                transmitted between our servers and your browser. The database backups are
                also encrypted. Most data is not encrypted while it lives in our database (since it needs to be
                ready to send to you when you need it). An exception is your password; It is stored
                as a hash that’s generated by a state of the art <a href="https://en.wikipedia.org/wiki/Key_derivation_function">password hashing function</a>.
            </Text>

            <Text mb="1rem">
                GameWatch is hosted and operated in the European Union.
                If you are located outside of the European Union,
                <strong>
                    {' '}please be aware that any information you provide to us will
                    be transferred to and stored in the European Union
                </strong>.
                By using our websites or Services and/or providing us with your personal
                information, you consent to this transfer.
            </Text>

            <Text mb="1rem">
                All data of an unregistered account, that was not active in the last 30 days is deleted permanently.
                After you delete your account, all data belonging to the account is deleted instantly, although some subprocessors might keep some data for some time after.
                See {'"Transmission to third countries"'} for more information.
            </Text>

            <Text fontSize="2xl">What are your data protection rights?</Text>
            <p>We would like to make sure you are fully aware of all of your data protection rights. Every user is
                entitled to the following:</p>
            <p><strong>The right to access</strong> – You have the right to request for copies of your personal
                data. We may charge you a small fee for this service.</p>
            <p><strong>The right to rectification</strong> – You have the right to request us that we correct any
                information you believe is inaccurate. You also have the right to request us to complete the
                information you believe is incomplete.</p>
            <p><strong>The right to erasure</strong> – You have the right to request that we erase your personal data,
                under certain conditions.</p>
            <p><strong>The right to restrict processing</strong> – You have the right to request that we restrict the
                processing of your personal data, under certain conditions.</p>
            <p><strong>The right to object to processing</strong> – You have the right to object to out processing of
                your personal data, under certain conditions.</p>
            <p><strong>The right to data portability</strong> – You have the right to request that we transfer the data
                that we have collected to another organization, or directly to you, under certain conditions.</p>
            <p>If you make a request, we have one month to respond to you. If you would like to exercise any of these rights,
                please contact us at our email:</p>
            <Flex><Text mr="0.5rem">Write to us at:</Text> <Text mr="0.5rem">huth </Text><Text mr="0.5rem">at </Text><Text mr="0.5rem">duck </Text><Text mr="0.5rem">dot </Text><Text>com</Text></Flex>

            <Text fontSize="2xl" mt="1rem">Cookies</Text>
            <p>Cookies are text files placed on your computer to collect standard Internet log information and visitor behavior
                information. When you visit our websites, we may collect information from you automatically through cookies or
                similar technology</p>
            <p>For further information, visit allaboutcookies.org.</p>

            <Text fontSize="xl" mt="1rem">How do we use cookies?</Text>
            <p>We use cookies in a range of ways to improve your experience on our website, including:</p>
            <ul>
                <li>Keeping you signed in</li>
            </ul>

            <Text fontSize="xl" mt="1rem">What types of cookies do we use?</Text>
            <p>There are a number of different types of cookies, however, our website uses:</p>
            <ul>
                <li>
                    Functionality – We use these cookies so that we recognize you on our website and remember your
                    previously selected preferences. These could include what language you prefer and location you are in.
                    Only first-party cookies are used.
                </li>
            </ul>

            <Text fontSize="xl" mt="1rem">How to manage cookies</Text>
            <p>You can set your browser not to accept cookies, and the above website tells you how to remove cookies from your
                browser. However, our websites features may not function as a result.</p>

            <Text fontSize="2xl" mt="1rem">Privacy policies of other websites</Text>
            <p>The Our website contains links to other websites. Our privacy policy applies only to our website, so if
                you click on a link to another website, you should read their privacy policy.</p>

            <Text fontSize="2xl" mt="1rem">Transmission to third countries</Text>
            <Text mb="1rem">
                We use some third-party subprocessors to help run our applications and provide the
                Services to you.
            </Text>

            <Text mb="1rem">
                Personal data is only transferred to countries outside the European Union (EU) if the conditions of Article 44 ff. GDPR are met. A third country is a country outside the European Union (EU) in which the GDPR is not directly applicable.

                The EU Commission has not issued an adequacy decision for the USA pursuant to Article 45 (1) GDPR. This is because, according to the European Court of Justice in its ruling of 16.07.2020 (Case C-311/18, “Schrems II”), there is no level of data protection in the USA that would be comparable to that in the EU. When transferring personal data to the US, there is a theoretical risk that US authorities could gain access to the personal data on the basis of the surveillance programmes PRISM and UPSTREAM based on Section 702 of FISA (Foreign Intelligence Surveillance Act) and on the basis of Executive Order 12333 or Presidential Police Directive 28. According to the European Court of Justice, EU citizens do not have effective legal protection against these accesses in the US or the EU.

                We only transfer your personal data to the USA or other third countries if either

                the recipient provides sufficient guarantees in accordance with Article 46 of the GDPR for the protection of personal data – for example, the conclusion of standard contractual clauses between us and the recipient (Article 46(2)(c) of the GDPR) or binding internal data protection rules approved by the competent data protection authorities (Article 46(2)(b) of the GDPR). In this way, the recipient assures that the data is adequately protected and thus guarantees a level of protection comparable to the GDPR.
                one of the exceptions listed in Article 49 of the GDPR applies – for example, your express consent (Article 49(1)(a) of the GDPR) or if the transfer is necessary for the performance of contractual obligations between you and us (Article 49(1)(b) of the GDPR).
            </Text>

            <Text mb="1rem">
                This website uses services of Cloudflare, Inc, 101 Townsend St, San Francisco, CA 94107, USA (hereinafter “Cloudflare”). Cloudflare operates a content delivery network (CDN) and provides protection functions for the website (web application firewall). The data transfer between your browser and our servers flows through Cloudflare’s infrastructure and is analyzed there to prevent attacks. Cloudflare uses cookies to enable you to access our website. The use of Cloudflare is in the interest of a secure use of our website and the defense against harmful attacks from outside. This constitutes a legitimate interest within the meaning of Article 6 para. 1 lit. f) GDPR.
                Your data will also be transferred to the USA. We have concluded a contract with Cloudflare that includes the EU standard contractual clauses. This ensures that a level of protection comparable to that in the EU exists.
                For more information, please see Cloudflare’s privacy statement: <a href="https://www.cloudflare.com/privacypolicy/">https://www.cloudflare.com/privacypolicy</a>
            </Text>

            <Text mb="1rem">
                We use the service “Datadog” of the service provider Datadog, Inc., 620 8th Ave 45th Floor New York, NY 10018 USA (hereinafter “Datadog”) to improve the technical stability of our service by monitoring system stability. Datadog serves these purposes alone and does not evaluate data for advertising purposes.
                The data will be deleted after 14 days.
                Your data will be stored in the EU.

                Further information can be found in the Datadog privacy policy: <a href="https://www.datadoghq.com/legal/privacy/.">https://www.datadoghq.com/legal/privacy</a>
            </Text>

            <Text mb="1rem">
                We use the Sendgrid service of Twilio Sendgrid Inc, 1801 California St #500 Denver, CO 80202, USA (hereinafter “Sendgrid”) to send emails. Sendgrid is used to send confirmation emails, transaction confirmations and emails with important information regarding existing requests. The dispatch via a specialized service provider is necessary to ensure the delivery of the e-mails to your e-mail account and to reduce the probability of these e-mails being classified as “spam” by your e-mail provider. This constitutes a legitimate interest within the meaning of Article 6 Para. 1 lit. f) GDPR. In addition, the use of Sendgrid is necessary for the fulfillment of the contract with you (Article 6 para. 1 lit. b) GDPR).

                The data provided with the respective request, including e-mail address, name and requested service, are processed.

                We have concluded a contract with Sendgrid that includes the EU standard contractual clauses. This ensures that a level of protection comparable to that in the EU exists (see also section 4 on data transfer to the USA).

                For more information, please see Sendgrid Inc.’s privacy policy: <a href="https://sendgrid.com/policies/privacy/?ust=1570226656505000">https://sendgrid.com/policies/privacy/?ust=1570226656505000</a>
            </Text>

            <Text mb="1rem">
                We use Plausible Analytics to track overall trends in the usage of our website. Plausible Analytics collects only aggregated information, which does not allow us to identify any visitor to our website.
                For more information, please visit the Plausible Analytics Data Policy: <a href="https://plausible.io/data-policy">https://plausible.io/data-policy</a>
            </Text>

            <Text mb="1rem">
                We use the service “Sentry”, offered by Functional Software Inc, 1501 Mariposa St #408, San Francisco, CA 94107, USA, to improve the technical stability of our service by monitoring system stability and detecting code errors. Sentry serves these purposes alone and does not evaluate data for advertising purposes. User data, such as information about the device or time of error, is collected anonymously and not used in a personalized manner and subsequently deleted.
                The legal basis for this processing is our legitimate interest in accordance with Article 6 (1) (f) GDPR in the operation of a functionally stable homepage.
                Your data will also be transmitted to the USA. We have concluded a contract with Functional Software Inc. that includes the EU standard contractual clauses. This ensures that a level of protection comparable to that in the EU exists.
                For further information, please refer to Sentry’s privacy policy: <a href="https://getsentry.com/privacy/.">https://getsentry.com/privacy</a>
            </Text>

            <Text mb="1rem">
                Your browser is loading images of games from the stores themselves or their respective CDNs.
                The servers these requests are sent to may register your access. For more information please see the privacy policy of the respective stores.
            </Text>

            <Text fontSize="2xl" mt="1rem">Changes to our privacy policy</Text>
            <p>
                We keep this privacy policy under regular review and places any updates on this web page.
            </p>

            <Text fontSize="2xl" mt="1rem">How to contact us</Text>
            <p>If you have any questions about our privacy policy, the data we hold on you, or you would like to
                exercise one of your data protection rights, please do not hesitate to contact us.</p>
            <Flex><Text mr="0.5rem">Email us at:</Text> <Text mr="0.5rem">huth </Text><Text mr="0.5rem">at </Text><Text mr="0.5rem">duck </Text><Text mr="0.5rem">dot </Text><Text>com</Text></Flex>
            <p>Or write to us at: <Text>Im Langgarten 1, 63589 Linsengericht</Text></p>

            <Text fontSize="2xl" mt="1rem">How to contact the appropriate authority</Text>
            <p>
                Should you wish to report a complaint or if you feel
                that we have not addressed your concern in a
                satisfactory manner, you may contact the Information Commissioner’s Office.
            </p>
            <p>Email: poststelle@bfdi.bund.de</p>
            <p>Address:
                Graurheindorfer Straße 153,
                53117 Bonn
            </p>

            <Text mb="1rem" mt="3rem">Adapted from the{' '}
                <a href="https://github.com/basecamp/policies">Basecamp open-source policies</a>
                {' '}/ <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>
            </Text>
        </Box>
    );
};

export default PrivacyPolicy;
