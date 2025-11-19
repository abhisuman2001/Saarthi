import Layout from "../components/Layout";

export default function Saarthi() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-12 px-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">SAARTHI – A Smart Assistant for Appliance Reminders and Treatment History</h1>

        <h2 className="text-lg font-semibold text-gray-800 mt-6">Interface: A Step Toward Technology-Driven Orthodontic Compliance</h2>

        <p className="mt-4 text-gray-700 leading-relaxed">
          Orthodontic treatment is inherently long-term, and its success depends not only on the orthodontist’s skill and appliance efficiency, but also significantly on patient compliance. This compliance, especially in removable appliance therapy, elastics wear, or aligner use, is difficult to monitor and predict but remains a key determinant of treatment outcomes. Traditional in-clinic counselling, printed instructions, or verbal motivation methods often lack reinforcement once the patient leaves the clinic. In a digital age where attention is fragmented and routine adherence is challenging, there is a growing need for structured, patient-friendly technological solutions to support orthodontic treatment continuity and compliance.
        </p>

        <p className="mt-4 text-gray-700 leading-relaxed">
          To address this need, we developed SAARTHI (Smart Assistant for Appliance Reminders and Treatment History Interface) – a user-friendly, web-based application designed specifically for orthodontic patients and practitioners. The platform aims to integrate modern AI-powered communication systems into orthodontic workflows by automating patient engagement through daily reminders, feedback loops, and digital record-keeping.
        </p>

        <p className="mt-4 text-gray-700 leading-relaxed">
          SAARTHI works on the principle of automated behaviour reinforcement, sending two reminders daily to patients regarding their appliance wear instructions. These reminders are customizable based on the removable appliance/components prescribed – such as aligners, elastics, headgears, retainers, or functional appliances. The application functions through secure cloud-based architecture and is accessible on both desktop and mobile browsers, requiring no installation. This makes it suitable for a wide demographics, including digitally novice users.
        </p>

        <p className="mt-4 text-gray-700 leading-relaxed">
          One of SAARTHI’s most valuable features is its feedback collection system. Patients are prompted to log their appliance-wear status, comfort issues, or queries, which are then compiled into a backend dashboard accessible to the orthodontist. This system not only helps in tracking individual patient compliance trends but also allows for real-time communication and remote patient monitoring. Over time, the cumulative data can be used to study patterns of non-compliance and their possible behavioural or appliance-related causes, opening avenues for research in compliance prediction and improvement strategies.
        </p>

        <p className="mt-4 text-gray-700 leading-relaxed">
          What sets SAARTHI apart is its alignment with open-source principles – it is being launched under the Creative Commons CC-BY-NC-SA 4.0 license, making it a freely accessible tool for academic and clinical use, with scope for collaborative development and non-commercial adaptation.
        </p>

        <p className="mt-4 text-gray-700 leading-relaxed">
          At this table clinic, attendees will receive a live demonstration of SAARTHI’s features and functionality. A hands-on experience will allow users to simulate the orthodontist and patient roles to explore the reminder-feedback loop. The system's simplicity, automation, and evidence-based foundation make it a promising adjunct for enhancing compliance, especially in remote or resource-constrained settings where follow-up challenges are common.
        </p>

        <p className="mt-4 text-gray-700 leading-relaxed">
          SAARTHI envisions becoming a “digital assistant” in every orthodontic clinic, aiding in reducing chairside time spent on repetitive counselling while improving adherence to appliance protocols. By merging behavioural reinforcement with cloud-based technology, SAARTHI represents a step forward in personalized, compliance-driven orthodontic care.
        </p>
      </div>
    </Layout>
  );
}
