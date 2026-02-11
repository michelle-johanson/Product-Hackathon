import { useState } from "react";
import { apiRequest } from "./lib/api";

export default function Dashboard({ user }) {
  const [groupName, setGroupName] = useState("");
  const [className, setClassName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [group, setGroup] = useState(null);

  const createGroup = async () => {
    try {
      const data = await apiRequest("/groups", {
        method: "POST",
        body: JSON.stringify({
          name: groupName,
          className,
        }),
      });

      setGroup(data);
      alert("Group created!");
    } catch (err) {
      alert(err.message);
    }
  };

  const joinGroup = async () => {
    try {
      await apiRequest("/groups/join", {
        method: "POST",
        body: JSON.stringify({ inviteCode }),
      });

      alert("Joined group!");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <h1>Welcome, {user.name}</h1>

      <h2>Create Group</h2>
      <input
        placeholder="Group name"
        onChange={(e) => setGroupName(e.target.value)}
      />
      <input
        placeholder="Class name"
        onChange={(e) => setClassName(e.target.value)}
      />
      <button onClick={createGroup}>Create</button>

      <h2>Join Group</h2>
      <input
        placeholder="Invite code"
        onChange={(e) => setInviteCode(e.target.value)}
      />
      <button onClick={joinGroup}>Join</button>

      {group && (
        <div>
          <h3>Created Group</h3>
          <p>Name: {group.name}</p>
          <p>Invite Code: {group.inviteCode}</p>
        </div>
      )}
    </div>
  );
}
