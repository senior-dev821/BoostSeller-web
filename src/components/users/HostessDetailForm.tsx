"use client";
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
// import Input from '@/components/form/input/InputField';
import Button from '@/components/ui/button/Button';
// import Label from '@/components/form/Label';
import Image from 'next/image';

interface Hostess {
  id: number;
  name: string;
  phone: string;
  email: string;
  image: string;
  registerDate: string;
  leads: Lead[];
}

interface Lead {
  id: number;
  name: string;
  status: 'completed' | 'accepted' | 'pending';
}

export default function HostessDetailForm() {
  const { id } = useParams<{ id: string }>();
  const [hostess, setHostess] = useState<Hostess | null>(null);

  useEffect(() => {
    // Fetch hostess data based on ID
    // Replace with actual data fetching logic
    const fetchHostess = async () => {
      // Example static data
      const data: Hostess = {
        id: Number(id),
        name: 'Lindsey Curtis',
        phone: '+7 324 1235 5777',
        email: 'lind@gmail.com',
        image: '/images/user/user-17.jpg',
        registerDate: '2023-01-15',
        leads: [
          { id: 1, name: 'Lead A', status: 'completed' },
          { id: 2, name: 'Lead B', status: 'accepted' },
          { id: 3, name: 'Lead C', status: 'pending' },
        ],
      };
      setHostess(data);
    };

    fetchHostess();
  }, [id]);

  if (!hostess) return <div>Loading...</div>;

  const completedLeads = hostess.leads.filter(lead => lead.status === 'completed').length;
  const acceptedLeads = hostess.leads.filter(lead => lead.status === 'accepted').length;
  const totalLeads = hostess.leads.length;

  return (
    <div className="p-6 space-y-6">
      {/* Main Info Section */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <Image
            src={hostess.image}
            alt={hostess.name}
            width={80}
            height={80}
            className="rounded-full"
          />
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {hostess.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">{hostess.email}</p>
            <p className="text-gray-600 dark:text-gray-300">{hostess.phone}</p>
            <p className="text-gray-600 dark:text-gray-300">
              Registered on: {hostess.registerDate}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <Button>Edit</Button>
        </div>
      </div>

      {/* Leads Section */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Leads
        </h3>
        <div className="flex space-x-4 mb-4">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300">Completed</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {completedLeads}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300">Accepted</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {acceptedLeads}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300">Total</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {totalLeads}
            </p>
          </div>
        </div>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                Lead Name
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {hostess.leads.map(lead => (
              <tr key={lead.id}>
                <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                  {lead.name}
                </td>
                <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                  {lead.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
