<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Support\ResourceRegistry;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Inertia\Inertia;

/** One controller behind all the simple list / add / edit / delete screens defined in ResourceRegistry. */
class ResourceController extends Controller
{
    /**
     * Keeps every panel to its own work: even if the registry lets a role read a list,
     * these screens are only opened for the roles named here (the registry stays the single place for fields and rules).
     */
    private const READ_LIMIT = [
        'course-types' => ['super_admin', 'admin'],
        'classrooms' => ['super_admin', 'admin'],
        'teaching-assignments' => ['super_admin', 'admin'],
        'subjects' => ['super_admin', 'admin', 'lecturer'],
        'batches' => ['super_admin', 'admin', 'lecturer'],
        'announcements' => ['super_admin', 'admin', 'lecturer'],
    ];

    private function definition(Request $request, string $resource, string $ability): array
    {
        $defs = ResourceRegistry::all();
        abort_unless(isset($defs[$resource]), 404);

        $def = $defs[$resource];
        $roles = $ability === 'read' ? $def['read'] : $def['write'];

        if ($ability === 'read' && isset(self::READ_LIMIT[$resource])) {
            $roles = array_values(array_intersect($roles, self::READ_LIMIT[$resource]));
        }
        abort_unless(in_array($request->user()->role, $roles, true), 403, 'You do not have permission to open this page.');

        return $def;
    }

    private function row(array $def, $model): array
    {
        $row = $model->attributesToArray();

        foreach ($def['display'] ?? [] as $key => $path) {
            $row[$key] = data_get($model, $path);
        }

        return $row;
    }

    public function index(Request $request, string $resource)
    {
        $def = $this->definition($request, $resource, 'read');
        $q = $def['model']::query()->with($def['with'] ?? []);

        if (! empty($def['count'])) {
            $q->withCount($def['count']);
        }

        if (($search = trim((string) $request->query('search', ''))) !== '') {
            $q->where(function ($w) use ($def, $search) {
                foreach ($def['search'] ?? [] as $i => $column) {
                    $w->{$i === 0 ? 'where' : 'orWhere'}($column, 'like', "%{$search}%");
                }
                foreach ($def['search_relation'] ?? [] as $relation => $columns) {
                    $w->orWhereHas($relation, function ($r) use ($columns, $search) {
                        foreach ($columns as $i => $column) {
                            $r->{$i === 0 ? 'where' : 'orWhere'}($column, 'like', "%{$search}%");
                        }
                    });
                }
            });
        }

        foreach ($def['filters'] ?? [] as $filter) {
            if ($request->filled($filter)) {
                $q->where($filter, $request->query($filter));
            }
        }

        $q->orderBy(...($def['order'] ?? ['id', 'desc']));

        $items = $q->paginate($def['per_page'] ?? 15)->withQueryString()->through(fn ($m) => $this->row($def, $m));

        $fields = collect($def['fields'])->map(function ($f) {
            if (isset($f['options']) && $f['options'] instanceof \Closure) {
                $f['options'] = ($f['options'])();
            }

            return $f;
        })->all();

        return Inertia::render('Manage/Index', [
            'resource' => [
                'key' => $resource,
                'title' => $def['title'],
                'singular' => $def['singular'],
                'help' => $def['help'] ?? null,
                'canWrite' => in_array($request->user()->role, $def['write'], true),
                'canCreate' => $def['create'] ?? true,
                'columns' => $def['columns'],
                'fields' => $fields,
            ],
            'items' => $items,
            'filters' => ['search' => $search],
        ]);
    }

    public function store(Request $request, string $resource)
    {
        $def = $this->definition($request, $resource, 'write');
        abort_if(($def['create'] ?? true) === false, 404);

        $data = $request->validate($def['rules'](null, null));

        if (isset($def['before'])) {
            $data = $def['before']($data, $request, null);
        }

        try {
            $item = isset($def['save']) ? $def['save']($data, null, $request) : $def['model']::create($data);
        } catch (QueryException $e) {
            report($e);

            return back()->with('error', 'That record already exists or conflicts with existing data.');
        }

        if (isset($def['after'])) {
            $def['after']($item, $request);
        }

        AuditLog::record('created', $item, "Created {$def['singular']} #{$item->getKey()}");

        return back()->with('success', "{$def['singular']} added.");
    }

    public function update(Request $request, string $resource, int $id)
    {
        $def = $this->definition($request, $resource, 'write');
        $item = $def['model']::findOrFail($id);
        $data = $request->validate($def['rules']($item->getKey(), $item));

        if (isset($def['before'])) {
            $data = $def['before']($data, $request, $item);
        }

        try {
            isset($def['save']) ? $def['save']($data, $item, $request) : $item->update($data);
        } catch (QueryException $e) {
            report($e);

            return back()->with('error', 'That change conflicts with existing data.');
        }

        AuditLog::record('updated', $item, "Updated {$def['singular']} #{$item->getKey()}");

        return back()->with('success', "{$def['singular']} saved.");
    }

    public function destroy(Request $request, string $resource, int $id)
    {
        $def = $this->definition($request, $resource, 'write');
        $item = $def['model']::findOrFail($id);

        if (! empty($def['protect_self']) && $item->getKey() === $request->user()->id) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        try {
            isset($def['destroy']) ? $def['destroy']($item) : $item->delete();
        } catch (QueryException $e) {
            return back()->with('error', "This record is in use and can't be deleted.");
        }

        AuditLog::record('deleted', $item, "Deleted {$def['singular']} #{$id}");

        return back()->with('success', "{$def['singular']} deleted.");
    }
}