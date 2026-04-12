// This script updates the dashboard page via Gutenberg block API
// Run this in browser console while on the dashboard edit page

const content = `<!-- wp:columns {"isStackedOnMobile":false} -->
<div class="wp-block-columns is-not-stacked-on-mobile"><!-- wp:column {"width":"220px"} -->
<div class="wp-block-column" style="flex-basis:220px"><!-- wp:group {"style":{"spacing":{"padding":{"top":"1rem","right":"0.75rem","bottom":"1rem","left":"0.75rem"}},"border":{"right":{"color":"#e5e7eb","width":"1px"}}},"backgroundColor":"base","layout":{"type":"flex","orientation":"vertical"}} -->
<div class="wp-block-group has-base-background-color has-background" style="border-right-color:#e5e7eb;border-right-width:1px;padding-top:1rem;padding-right:0.75rem;padding-bottom:1rem;padding-left:0.75rem"><!-- wp:paragraph {"style":{"spacing":{"padding":{"top":"0.5rem","right":"0.75rem","bottom":"0.5rem","left":"0.75rem"}},"typography":{"fontSize":"0.875rem"}}} -->
<p style="padding-top:0.5rem;padding-right:0.75rem;padding-bottom:0.5rem;padding-left:0.75rem;font-size:0.875rem"><a href="/careconnected/dashboard/">🏠 Dashboard</a></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"spacing":{"padding":{"top":"0.5rem","right":"0.75rem","bottom":"0.5rem","left":"0.75rem"}},"typography":{"fontSize":"0.875rem"}}} -->
<p style="padding-top:0.5rem;padding-right:0.75rem;padding-bottom:0.5rem;padding-left:0.75rem;font-size:0.875rem"><a href="/careconnected/cared-ones/">❤️ Loved Ones</a></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"spacing":{"padding":{"top":"0.5rem","right":"0.75rem","bottom":"0.5rem","left":"0.75rem"}},"typography":{"fontSize":"0.875rem"}}} -->
<p style="padding-top:0.5rem;padding-right:0.75rem;padding-bottom:0.5rem;padding-left:0.75rem;font-size:0.875rem"><a href="/careconnected/bookings/">📅 Appointments</a></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"spacing":{"padding":{"top":"0.5rem","right":"0.75rem","bottom":"0.5rem","left":"0.75rem"}},"typography":{"fontSize":"0.875rem"}}} -->
<p style="padding-top:0.5rem;padding-right:0.75rem;padding-bottom:0.5rem;padding-left:0.75rem;font-size:0.875rem"><a href="/careconnected/inbox/">💬 Messages</a></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"spacing":{"padding":{"top":"0.5rem","right":"0.75rem","bottom":"0.5rem","left":"0.75rem"}},"typography":{"fontSize":"0.875rem"}}} -->
<p style="padding-top:0.5rem;padding-right:0.75rem;padding-bottom:0.5rem;padding-left:0.75rem;font-size:0.875rem"><a href="/careconnected/care-circle/">👥 Care Teams</a></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"spacing":{"padding":{"top":"0.5rem","right":"0.75rem","bottom":"0.5rem","left":"0.75rem"}},"typography":{"fontSize":"0.875rem"}}} -->
<p style="padding-top:0.5rem;padding-right:0.75rem;padding-bottom:0.5rem;padding-left:0.75rem;font-size:0.875rem"><a href="/careconnected/jobs/">💼 Jobs Board</a></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"spacing":{"padding":{"top":"0.5rem","right":"0.75rem","bottom":"0.5rem","left":"0.75rem"}},"typography":{"fontSize":"0.875rem"}}} -->
<p style="padding-top:0.5rem;padding-right:0.75rem;padding-bottom:0.5rem;padding-left:0.75rem;font-size:0.875rem"><a href="/careconnected/store-listing/">🔍 Find Help</a></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"spacing":{"padding":{"top":"0.5rem","right":"0.75rem","bottom":"0.5rem","left":"0.75rem"}},"typography":{"fontSize":"0.875rem"}}} -->
<p style="padding-top:0.5rem;padding-right:0.75rem;padding-bottom:0.5rem;padding-left:0.75rem;font-size:0.875rem"><a href="/careconnected/gps-tracking/">📍 GPS Tracking</a></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"spacing":{"padding":{"top":"0.5rem","right":"0.75rem","bottom":"0.5rem","left":"0.75rem"}},"typography":{"fontSize":"0.875rem"}}} -->
<p style="padding-top:0.5rem;padding-right:0.75rem;padding-bottom:0.5rem;padding-left:0.75rem;font-size:0.875rem"><a href="/careconnected/favorites/">⭐ Favorites</a></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"spacing":{"padding":{"top":"0.5rem","right":"0.75rem","bottom":"0.5rem","left":"0.75rem"}},"typography":{"fontSize":"0.875rem"}}} -->
<p style="padding-top:0.5rem;padding-right:0.75rem;padding-bottom:0.5rem;padding-left:0.75rem;font-size:0.875rem"><a href="/careconnected/provider-dashboard/">⚙️ Provider Hub</a></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"spacing":{"padding":{"top":"0.5rem","right":"0.75rem","bottom":"0.5rem","left":"0.75rem"}},"typography":{"fontSize":"0.875rem"}}} -->
<p style="padding-top:0.5rem;padding-right:0.75rem;padding-bottom:0.5rem;padding-left:0.75rem;font-size:0.875rem"><a href="/careconnected/notifications/">🔔 Notifications</a></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"spacing":{"padding":{"top":"0.5rem","right":"0.75rem","bottom":"0.5rem","left":"0.75rem"}},"typography":{"fontSize":"0.875rem"}}} -->
<p style="padding-top:0.5rem;padding-right:0.75rem;padding-bottom:0.5rem;padding-left:0.75rem;font-size:0.875rem"><a href="/careconnected/profile/">👤 My Profile</a></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:column -->

<!-- wp:column {"style":{"color":{"background":"#f9fafb"}}} -->
<div class="wp-block-column has-background" style="background-color:#f9fafb"><!-- wp:group {"style":{"spacing":{"padding":{"top":"1.5rem","right":"1.5rem","left":"1.5rem"}}},"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"space-between"}} -->
<div class="wp-block-group" style="padding-top:1.5rem;padding-right:1.5rem;padding-left:1.5rem"><!-- wp:group {"layout":{"type":"flex","orientation":"vertical"}} -->
<div class="wp-block-group"><!-- wp:heading {"level":1,"style":{"typography":{"fontSize":"clamp(0.984rem, 0.984rem + ((1vw - 0.2rem) * 0.809), 1.5rem)","fontWeight":"700"},"spacing":{"margin":{"top":"0","bottom":"0.25rem"}}}} -->
<h1 class="wp-block-heading" style="margin-top:0;margin-bottom:0.25rem;font-size:clamp(0.984rem, 0.984rem + ((1vw - 0.2rem) * 0.809), 1.5rem);font-weight:700">Welcome back!</h1>
<!-- /wp:heading -->

<!-- wp:paragraph {"style":{"color":{"text":"#6b7280"},"typography":{"fontSize":"0.875rem"}}} -->
<p class="has-text-color" style="color:#6b7280;font-size:0.875rem">Here is your care overview and daily summary.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->

<!-- wp:spacer {"height":"1.25rem"} -->
<div style="height:1.25rem" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:group {"style":{"spacing":{"padding":{"right":"1.5rem","left":"1.5rem"}}},"layout":{"type":"default"}} -->
<div class="wp-block-group" style="padding-right:1.5rem;padding-left:1.5rem">`;

// Read component blocks from files
fetch('/Users/guoweijiang/Downloads/challenged/tmp/dashboard-stats-block.html')
  .then(r => r.text())
  .then(statsBlock => {
    return fetch('/Users/guoweijiang/Downloads/challenged/tmp/dashboard-bookings-block.html')
      .then(r => r.text())
      .then(bookingsBlock => {
        // Continue loading other blocks...
        console.log('Blocks loaded, updating page...');
        
        // Parse blocks and update
        const blocks = wp.blocks.parse(content + statsBlock + bookingsBlock + '...</div><!-- /wp:group --></div><!-- /wp:column --></div><!-- /wp:columns -->');
        wp.data.dispatch('core/block-editor').resetBlocks(blocks);
        
        // Save
        wp.data.dispatch('core').saveEditedEntityRecord('postType', 'page', 24);
        console.log('Dashboard updated!');
      });
  });
