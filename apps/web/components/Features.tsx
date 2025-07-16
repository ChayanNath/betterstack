import { 
  Globe, 
  Zap, 
  Shield, 
  AlertCircle, 
  BarChart3, 
  Smartphone,
  Clock,
  Users,
  Lock
} from 'lucide-react';

const features = [
  {
    icon: Globe,
    title: 'Global Monitoring',
    description: 'Monitor from 6 continents with 50+ monitoring locations worldwide for accurate results.'
  },
  {
    icon: Zap,
    title: 'Instant Alerts',
    description: 'Get notified via SMS, email, Slack, or webhook the moment your site goes down.'
  },
  {
    icon: BarChart3,
    title: 'Detailed Reports',
    description: 'Beautiful uptime reports and analytics to share with your team and customers.'
  },
  {
    icon: Smartphone,
    title: 'Mobile App',
    description: 'Monitor your sites on-the-go with our iOS and Android mobile applications.'
  },
  {
    icon: Clock,
    title: 'Fast Checks',
    description: 'Check your website every 30 seconds with sub-second response time measurements.'
  },
  {
    icon: Users,
    title: 'Team Management',
    description: 'Collaborate with your team using role-based access control and shared dashboards.'
  },
  {
    icon: Shield,
    title: 'SSL Monitoring',
    description: 'Monitor SSL certificates and get alerts before they expire to avoid downtime.'
  },
  {
    icon: Lock,
    title: 'Private Monitoring',
    description: 'Monitor internal services and private networks with our secure monitoring agents.'
  },
  {
    icon: AlertCircle,
    title: 'Status Pages',
    description: 'Create beautiful status pages to keep your customers informed during incidents.'
  }
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Everything you need to monitor your website
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Comprehensive monitoring tools that help you stay ahead of downtime 
            and keep your users happy with reliable service.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="p-6 rounded-lg border border-gray-700 bg-gray-800 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 group"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-900/50 rounded-lg mb-4 group-hover:bg-blue-800/50 transition-colors">
                <feature.icon className="h-6 w-6 text-blue-400" />
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              
              <p className="text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-16 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl p-8 border border-gray-700">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              Trusted by 10,000+ websites worldwide
            </h3>
            <p className="text-gray-300 mb-6">
              Join thousands of companies that trust BetterUptime to monitor their critical services.
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="text-lg font-semibold text-gray-300">Stripe</div>
              <div className="text-lg font-semibold text-gray-300">Shopify</div>
              <div className="text-lg font-semibold text-gray-300">GitHub</div>
              <div className="text-lg font-semibold text-gray-300">Vercel</div>
              <div className="text-lg font-semibold text-gray-300">Netlify</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}