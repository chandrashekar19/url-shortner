import { getUserInfo } from "@/apis/users";
import { useEffect, useState } from "react";

export default function Admin() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const data = await getUserInfo();
      setUsers(data.domains || []);
    })();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold mb-4">Admin Panel</h1>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">Email</th>
            <th className="p-2">Domains</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={i} className="border-t">
              <td className="p-2">{u.address}</td>
              <td className="p-2">{u.homepage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
