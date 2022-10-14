/* eslint-disable max-len */
import { Box, Link, Text } from '@chakra-ui/react';
import { NextPage } from 'next';

const ToS: NextPage = () => {
    return (
        <Box>
            <Text fontSize="2xl" textAlign="center" mb="2rem">Our Terms of Service</Text>
            <Text mb="1rem"><em>Last updated: Oct 15, 2022</em></Text>

            <Text mb="1rem">We may update these Terms of Service in the future. You can track all changes made <a href="https://github.com/agreon/game-watch/commits/main">on GitHub</a>. Typically these changes have been to clarify some of these terms by linking to an expanded related policy. Whenever we make a significant change to our policies, we will refresh the date at the top of this page and take any other appropriate steps to notify account holders.</Text>
            <Text mb="1rem">When you use our Services, now or in the future, you are agreeing to the latest Terms of Service. That’s true for any of our existing and future products and all features that we add to our Services over time. There may be times where we do not exercise or enforce any right or provision of the Terms of Service; in doing so, we are not waiving that right or provision. <strong>These terms do contain a limitation of our liability.</strong></Text>
            <Text mb="1rem">If you violate any of the terms, we may terminate your account.</Text>
            <Text fontSize="2xl">Account Terms</Text>
            <ol>
                <li>You are responsible for maintaining the security of your account and password. We cannot and will not be liable for any loss or damage from your failure to comply with this security obligation.</li>
                <li>You are responsible for all content posted and activity that occurs under your account. That includes content posted by others who have access to your login credentials.</li>
                <li>You must be a human. Accounts registered by “bots” or other automated methods are not permitted.</li>
            </ol>

            <Text fontSize="2xl" id="cancellation-and-termination">Cancellation and Termination</Text>
            <ol>
                <li>You are solely responsible for properly canceling your account. Within our Service, we provide a simple no-questions-asked cancellation link in the user settings.</li>

                <li>All of your content will be inaccessible from the Services immediately upon account cancellation. Within 30 days, all content will be permanently deleted from active systems and logs. Within 60 days, all content will be permanently deleted from our backups. We cannot recover this information once it has been permanently deleted.</li>
                <li>We have the right to suspend or terminate your account and refuse any and all current or future use of our Services for any reason at any time. Suspension means you and any other users on your account will not be able to access the account or any content in the account. Termination will furthermore result in the deletion of your account or your access to your account, and the forfeiture and relinquishment of all content in your account. We also reserve the right to refuse the use of the Services to anyone for any reason at any time. We have this clause because statistically speaking, out of the hundreds of thousands of accounts on our Services, there is at least one doing something nefarious. There are some things we staunchly stand against and this clause is how we exercise that stance.</li>
                <li>Verbal, physical, written or other abuse (including threats of abuse or retribution) of employee or officer will result in immediate account termination.</li>
            </ol>

            <Text fontSize="2xl" id="modifications-to-the-service-and-prices">Modifications to the Service and Prices</Text>
            <ol>
                <li>We reserve the right at any time to modify or discontinue, temporarily or permanently, any part of our Services with or without notice.</li>
            </ol>

            <Text fontSize="2xl" id="uptime-security-and-privacy">Uptime, Security, and Privacy</Text>
            <ol>
                <li>Your use of the Services is at your sole risk. We provide these Services on an “as is” and “as available” basis. We do not offer service-level agreements for our Services but do take uptime of our applications seriously.</li>
                <li>We reserve the right to temporarily disable your account if your usage significantly exceeds the average usage of other customers of the Services. Of course, we’ll reach out to the account owner before taking any action except in rare cases where the level of use may negatively impact the performance of the Service for other customers.</li>
                <li>We take many measures to protect and secure your data through backups, redundancies, and encryption. We enforce encryption for data transmission from the public Internet.</li>
                <li><Text mb="1rem">When you use our Services, you entrust us with your data. We take that trust to heart. You agree that we may process your data as described in our <Link fontWeight="bold" href="/privacy-policy">Privacy Policy</Link> and for no other purpose. We as humans can access your data for the following reasons:</Text>
                    <ul>
                        <li><strong>To help you with support requests you make.</strong> We’ll ask for express consent before accessing your account.</li>
                        <li><strong>On the rare occasions when an error occurs that stops an automated process partway through.</strong> We get automated alerts when such errors occur. When we can fix the issue and restart automated processing without looking at any personal data, we do. In rare cases, we have to look at a minimum amount of personal data to fix the issue. In these rare cases, we aim to fix the root cause as much as possible to avoid the errors from reoccurring.</li>
                        <li><strong>To safeguard our services.</strong> We’ll look at logs and metadata as part of our work to ensure the security of your data and the Services as a whole.</li>
                        <li><strong>To the extent required by applicable law.</strong> As a german company with all data infrastructure located in the EU, we only preserve or share customer data if compelled by a EU government authority with a legally binding order.</li>
                    </ul>
                </li>
                <li>We process any data you share with us only for the purpose you signed up for and as described in these Terms of Service and our <Link fontWeight="bold" href="/privacy-policy">Privacy Policy</Link>. We do not retain, use, disclose, or sell any of that information for any other commercial purposes unless we have your explicit permission. </li>
            </ol>

            <Text fontSize="2xl" id="features-and-bugs">Features and Bugs</Text>
            <Text mb="1rem">We design our Services with care, based on our own experience and the experiences of customers who share their time and feedback. However, there is no such thing as a service that pleases everybody. We make no guarantees that our Services will meet your specific requirements or expectations.</Text>
            <Text mb="1rem">We also test all of our features extensively before shipping them. As with any software, our Services inevitably have some bugs. We track the bugs reported to us and work through priority ones, especially any related to security or privacy. Not all reported bugs will get fixed and we don’t guarantee completely error-free Services.</Text>

            <Text fontSize="2xl" id="liability">Liability</Text>
            <Text mb="1rem">We mention liability throughout these Terms but to put it all in one section:</Text>
            <Text mb="1rem">
                <strong>
                    <em>
                        You expressly understand and agree that we shall not be liable, in law
                        or in equity, to you or to any third party for any direct, indirect,
                        incidental, lost profits, special, consequential, punitive or exemplary
                        damages, including, but not limited to, damages for loss of profits,
                        goodwill, use, data or other intangible losses (even if the Company
                        has been advised of the possibility of such damages), resulting from:
                        (i) the use or the inability to use the Services; (ii) the cost
                        of procurement of substitute goods and services resulting from any
                        goods, data, information or services purchased or obtained or
                        messages received or transactions entered into through or from
                        the Services; (iii) unauthorized access to or alteration of your
                        transmissions or data; (iv) statements or conduct of any third
                        party on the service; (v) or any other matter relating to this
                        Terms of Service or the Services, whether as a breach of contract,
                        tort (including negligence whether active or passive), or any
                        other theory of liability.
                    </em>
                </strong>
            </Text>
            <Text mb="1rem">
                In other words: choosing to use our Services does mean you are making a bet on us.
                If the bet does not work out, that’s on you, not us. We do our darnedest to be as
                safe a bet as possible.
                If you choose to use our Services, thank you for betting on us.
            </Text>
            <Text mb="1rem">If you have a question about any of the Terms of Service, please <a href="{{ site.email_support }}">contact our Support team</a>.</Text>

            <Text mb="1rem" mt="3rem">Adapted from the{' '}
                <a href="https://github.com/basecamp/policies">Basecamp open-source policies</a>
                {' '}/ <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></Text>
        </Box>
    );
};

export default ToS;
