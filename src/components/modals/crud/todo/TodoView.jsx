const TodoView = ({ item }) => {
  const { task, description, status, category, priority } = item;

  return (
    <div className="rounded-xl bg-slate-400 text-stone-100 p-4 space-y-2">
      <div className="text-xl bg-slate-600 rounded-lg px-4 flex items-center justify-between">
        <div className="">{task}</div>
        <div className="px-2 py-1 rounded text-xs bg-slate-500">Priority: {priority}</div>
      </div>
      <div className="bg-slate-500 rounded-lg px-4">{category}</div>
      <div className="bg-slate-500 rounded-lg px-4">{description}</div>
      <div className="bg-slate-500 rounded-lg px-4">{status}</div>
    </div>
  );
};

export default TodoView;
