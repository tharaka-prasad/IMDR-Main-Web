<?php

namespace App\Http\Controllers;

use App\Support\Panels;
use Illuminate\Http\Request;

/**
 * /admin, /lecturer, /student and /accountant are the entrances of the four panels.
 * Everyone can only enter the panel that belongs to their own role; any other panel answers "no access".
 * All panels are served from /portal (each role gets its own layout and menu there).
 */
class PanelController extends Controller
{
    public function __invoke(Request $request, string $panel)
    {
        $own = Panels::forRole($request->user()->role);

        abort_unless(
            $own === $panel,
            403,
            'This is the '.Panels::label($panel).'. Your account belongs to the '.Panels::label($own).'.'
        );

        return redirect('/portal');
    }
}
