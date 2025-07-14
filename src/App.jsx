import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { format, parseISO, startOfWeek, addDays, isSameDay } from "date-fns";

const teamMembers = ["Nicola", "Marco", "Giulia", "Luca"];
const tagOptions = ["Urgente", "Normale", "Bassa Priorità"];
const tagColors = {
  "Urgente": "bg-red-200 text-red-800",
  "Normale": "bg-yellow-200 text-yellow-800",
  "Bassa Priorità": "bg-green-200 text-green-800"
};

const loadFromStorage = () => {
  const saved = localStorage.getItem("taskColumns");
  return saved ? JSON.parse(saved) : {
    "To Do": [],
    "In Progress": [],
    "Done": []
  };
};

export default function TrelloApp() {
  const [columns, setColumns] = useState(loadFromStorage);
  const [newTitle, setNewTitle] = useState("");
  const [newAssignee, setNewAssignee] = useState(teamMembers[0]);
  const [newDueDate, setNewDueDate] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTag, setNewTag] = useState(tagOptions[1]);
  const [editTask, setEditTask] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAssignee, setEditAssignee] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTag, setEditTag] = useState(tagOptions[1]);

  useEffect(() => {
    localStorage.setItem("taskColumns", JSON.stringify(columns));
  }, [columns]);

  const moveCard = (from, to, cardIndex) => {
    const fromCol = [...columns[from]];
    const toCol = [...columns[to]];
    const [moved] = fromCol.splice(cardIndex, 1);
    toCol.push(moved);
    setColumns({ ...columns, [from]: fromCol, [to]: toCol });
  };

  const deleteCard = (col, cardIndex) => {
    const colCopy = [...columns[col]];
    colCopy.splice(cardIndex, 1);
    setColumns({ ...columns, [col]: colCopy });
  };

  const addTask = () => {
    if (!newTitle.trim()) return;
    const newTask = {
      id: Date.now(),
      title: newTitle,
      assignedTo: newAssignee,
      dueDate: newDueDate,
      description: newDescription,
      tag: newTag
    };
    setColumns({
      ...columns,
      "To Do": [...columns["To Do"], newTask]
    });
    setNewTitle("");
    setNewDueDate("");
    setNewDescription("");
    setNewTag(tagOptions[1]);
  };

  const filterBy = (name) => {
    const filtered = loadFromStorage();
    const result = {};
    for (const key in filtered) {
      result[key] = filtered[key].filter((task) => task.assignedTo === name);
    }
    setColumns(result);
  };

  const openEdit = (col, idx) => {
    const task = columns[col][idx];
    setEditTask({ col, idx });
    setEditTitle(task.title);
    setEditAssignee(task.assignedTo);
    setEditDueDate(task.dueDate || "");
    setEditDescription(task.description || "");
    setEditTag(task.tag || tagOptions[1]);
  };

  const saveEdit = () => {
    const colCopy = [...columns[editTask.col]];
    colCopy[editTask.idx] = {
      ...colCopy[editTask.idx],
      title: editTitle,
      assignedTo: editAssignee,
      dueDate: editDueDate,
      description: editDescription,
      tag: editTag
    };
    setColumns({ ...columns, [editTask.col]: colCopy });
    setEditTask(null);
  };

  const today = new Date();
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(today, { weekStartsOn: 1 }), i));
  const allTasks = Object.values(columns).flat();

  return (
    <div className="p-4 space-y-6">
      <div className="flex space-x-2">
        <Input
          placeholder="Titolo del task"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <Select value={newAssignee} onValueChange={setNewAssignee}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {teamMembers.map((member) => (
              <SelectItem key={member} value={member}>{member}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={newDueDate}
          onChange={(e) => setNewDueDate(e.target.value)}
        />
        <Input
          placeholder="Descrizione"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
        />
        <Select value={newTag} onValueChange={setNewTag}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {tagOptions.map((tag) => (
              <SelectItem key={tag} value={tag}>{tag}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={addTask}>Aggiungi Task</Button>
        <Select onValueChange={filterBy} defaultValue="">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtra per persona" />
          </SelectTrigger>
          <SelectContent>
            {teamMembers.map((member) => (
              <SelectItem key={member} value={member}>{member}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {Object.keys(columns).map((col) => (
          <div key={col} className="bg-gray-100 rounded-xl p-2 shadow">
            <h2 className="text-xl font-bold mb-2">{col}</h2>
            {columns[col].map((card, idx) => (
              <Card key={card.id} className="mb-2">
                <CardContent className="p-3">
                  <p className="font-semibold flex justify-between">
                    {card.title}
                    {card.tag && (
                      <span className={`text-xs px-2 py-1 rounded ${tagColors[card.tag]}`}>{card.tag}</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">Assegnato a: {card.assignedTo}</p>
                  {card.dueDate && (
                    <p className="text-sm text-gray-500">Scadenza: {card.dueDate}</p>
                  )}
                  {card.description && (
                    <p className="text-sm text-gray-600 mt-1">{card.description}</p>
                  )}
                  <div className="mt-2 space-x-2">
                    {Object.keys(columns)
                      .filter((target) => target !== col)
                      .map((target) => (
                        <Button
                          key={target}
                          size="sm"
                          onClick={() => moveCard(col, target, idx)}
                        >
                          Sposta in {target}
                        </Button>
                      ))}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" onClick={() => openEdit(col, idx)}>
                          Modifica
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <Label className="block mb-1">Titolo</Label>
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                        />
                        <Label className="block mt-4 mb-1">Assegnato a</Label>
                        <Select value={editAssignee} onValueChange={setEditAssignee}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {teamMembers.map((member) => (
                              <SelectItem key={member} value={member}>{member}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Label className="block mt-4 mb-1">Scadenza</Label>
                        <Input
                          type="date"
                          value={editDueDate}
                          onChange={(e) => setEditDueDate(e.target.value)}
                        />
                        <Label className="block mt-4 mb-1">Descrizione</Label>
                        <Input
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                        />
                        <Label className="block mt-4 mb-1">Priorità</Label>
                        <Select value={editTag} onValueChange={setEditTag}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {tagOptions.map((tag) => (
                              <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button className="mt-4" onClick={saveEdit}>Salva modifiche</Button>
                      </DialogContent>
                    </Dialog>
                    <Button size="sm" variant="destructive" onClick={() => deleteCard(col, idx)}>Elimina</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4">Timeline Settimanale</h2>
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((day, i) => (
            <div key={i} className="bg-slate-100 p-3 rounded shadow">
              <p className="font-bold text-center">{format(day, "EEEE dd/MM")}</p>
              {allTasks.filter(task => task.dueDate && isSameDay(parseISO(task.dueDate), day)).map(task => (
                <div key={task.id} className={`mt-2 p-2 rounded text-sm ${tagColors[task.tag]}`}>
                  <p className="font-semibold">{task.title}</p>
                  <p>{task.assignedTo}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
