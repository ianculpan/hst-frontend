import CrudButtons from './CrudButtons';
import { apiClient } from '../helpers/apiHelper.js';
import { useModal } from './modals/ModalContext.jsx';
import TodoView from './modals/crud/todo/TodoView.jsx';
import TodoEdit from './modals/crud/todo/TodoEdit.jsx';
import TodoDelete from './modals/crud/todo/TodoDelete.jsx';

const TodoCard = ({ item, onUpdate }) => {
  const { task, description, status, category, priority } = item;

  const { openModal } = useModal();
  const { closeModal } = useModal();

  const handleClose = async () => {
    const response = await apiClient.patch(`/todos/${item.id}`, {
      ...item,
      status: 'Closed',
    });
    if (response?.status === 200 && onUpdate) {
      onUpdate({ ...item, status: 'Closed' });
    }
  };

  const viewModal = () => {
    openModal(<TodoView item={item} />);
  };
  const editModal = () => {
    openModal(<TodoEdit item={item} closeModal={closeModal} onUpdate={onUpdate} />);
  };
  const deleteModal = () => {
    openModal(<TodoDelete item={item} closeModal={closeModal} onUpdate={onUpdate} />);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      1: 'bg-red-600', // Highest priority - red
      2: 'bg-red-500',
      3: 'bg-orange-600',
      4: 'bg-orange-500',
      5: 'bg-yellow-500', // Medium priority - yellow
      6: 'bg-yellow-400',
      7: 'bg-green-500',
      8: 'bg-green-400',
      9: 'bg-blue-500',
      10: 'bg-gray-500', // Lowest priority - gray
    };
    return colors[priority] || 'bg-gray-500';
  };
  return (
    <div className="rounded-xl card p-4 space-y-2">
      <div className="text-xl card-title rounded-lg px-4 flex items-center justify-between">
        <div className="truncate">{task}</div>
        <div className="flex items-center gap-2">
          {status !== 'Closed' && (
            <button
              onClick={handleClose}
              className="p-2 rounded hover:bg-green-100 text-green-400"
              title="Mark Complete"
              aria-label="Mark Complete"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
              </svg>
            </button>
          )}
          <CrudButtons onView={viewModal} onEdit={editModal} onDelete={deleteModal} />
        </div>
      </div>
      <div className="card-text rounded-lg px-4">{category}</div>
      <div className="card-text rounded-lg px-4 line-clamp-4">{description}</div>
      <div className="flex items-center justify-between">
        <div className="card-text rounded-lg px-4 flex-1 mr-2">{status}</div>
        <div
          className={`${getPriorityColor(
            priority
          )} rounded-lg px-3 py-1 text-white font-semibold text-sm`}
        >
          P{priority}
        </div>
      </div>
    </div>
  );
};

export default TodoCard;
