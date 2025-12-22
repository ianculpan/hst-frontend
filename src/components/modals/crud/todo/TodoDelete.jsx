import { apiClient } from '../../../../helpers/apiHelper.js';

const TodoDelete = ({ item, closeModal, onUpdate }) => {
  const { id, task, description, status, category } = item;

  const deleteTodo = async () => {
    await apiClient.delete(`/todos/${id}`);
    if (onUpdate) onUpdate({ id, deleted: true });
    closeModal();
  };

  return (
    <div className="rounded-xl bg-indigo-400 text-stone-100 p-4 space-y-2">
      <div className="text-xl bg-indigo-600 rounded-lg px-4 flex items-center justify-between">
        <div className="">{task}</div>
      </div>
      <div className="bg-indigo-500 rounded-lg px-4">{category}</div>
      <div className="bg-indigo-500 rounded-lg px-4">{description}</div>
      <div className="bg-indigo-500 rounded-lg px-4">{status}</div>
      <div className="flex flex-row justify-between">
        <button className="bg-red-800 text-stone-200 rounded-lg py-2 px-4" onClick={deleteTodo}>
          Confirm Delete
        </button>
        <button className="bg-blue-800 text-stone-200 rounded-lg py-2 px-4" onClick={closeModal}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default TodoDelete;
