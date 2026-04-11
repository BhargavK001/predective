import Card, { CardHeader, CardTitle } from '../components/Card';

const About = () => {
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>About the Project</CardTitle>
                </CardHeader>
                <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
                    <p>
                        The <strong>IoT-Based Predictive Maintenance System</strong> is a comprehensive final-year engineering project designed to leverage Machine Learning capabilities to anticipate industrial machine failures before they unexpectedly occur.
                    </p>
                    <p>
                        By analyzing real-time incoming sensor data streams—including metrics like Air Temperature, Process Temperature, Rotational Speed, Torque, and Tool Wear—the system is able to provide an accurate assessment of machine health status and risk of immediate failure.
                    </p>
                </div>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Technology Stack</CardTitle>
                </CardHeader>
                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700 mt-2">
                    <li><strong className="text-gray-900">Frontend:</strong> React.js, Vite, Tailwind CSS, Recharts for strict data visualization.</li>
                    <li><strong className="text-gray-900">Backend API:</strong> Node.js, Express for reliable routing and ML communication.</li>
                    <li><strong className="text-gray-900">Machine Learning:</strong> Python, scikit-learn, FastAPI serving a serialized Classification model.</li>
                    <li><strong className="text-gray-900">Dataset:</strong> AI4I 2020 Predictive Maintenance Dataset.</li>
                </ul>
            </Card>
        </div>
    );
};

export default About;
